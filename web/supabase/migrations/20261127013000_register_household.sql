-- Atomic household registration + RLS fixes for signup chicken-and-egg

-- Allow a member to read a household that matches their profile email
-- (needed when linking during signup before household_id is set)
drop policy if exists "households select" on public.households;
create policy "households select" on public.households
  for select using (
    public.current_role() = 'admin'
    or id in (select household_id from public.profiles where id = auth.uid())
    or email = (select email from public.profiles where id = auth.uid())
  );

-- Members can insert their own household member rows once the household is linked,
-- or while registering (household email matches their profile email).
drop policy if exists "members write" on public.household_members;
create policy "members write" on public.household_members
  for all using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
    or household_id in (
      select h.id from public.households h
      join public.profiles p on p.email = h.email
      where p.id = auth.uid()
    )
  )
  with check (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
    or household_id in (
      select h.id from public.households h
      join public.profiles p on p.email = h.email
      where p.id = auth.uid()
    )
  );

drop policy if exists "members select" on public.household_members;
create policy "members select" on public.household_members
  for select using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
    or household_id in (
      select h.id from public.households h
      join public.profiles p on p.email = h.email
      where p.id = auth.uid()
    )
  );

-- One-shot register: create household + members + link profile
create or replace function public.register_household(
  p_family_name text,
  p_primary_name text,
  p_email text,
  p_phone text,
  p_address_line1 text,
  p_address_line2 text,
  p_city text,
  p_state text,
  p_zip text,
  p_photo_url text,
  p_avatar_url text,
  p_members jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_hid uuid;
  v_existing uuid;
  v_member jsonb;
  v_idx int := 0;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select household_id into v_existing from public.profiles where id = v_uid;
  if v_existing is not null then
    return v_existing;
  end if;

  insert into public.households (
    family_name,
    primary_name,
    email,
    phone,
    address_line1,
    address_line2,
    city,
    state,
    zip,
    photo_url,
    status,
    source,
    needs_review,
    notes
  ) values (
    p_family_name,
    p_primary_name,
    lower(trim(p_email)),
    coalesce(p_phone, ''),
    coalesce(p_address_line1, ''),
    nullif(p_address_line2, ''),
    coalesce(p_city, ''),
    coalesce(p_state, 'TX'),
    coalesce(p_zip, ''),
    nullif(p_photo_url, ''),
    'active',
    'signup',
    true,
    'Registered via household signup — awaiting temple review'
  )
  returning id into v_hid;

  if p_members is not null then
    for v_member in select * from jsonb_array_elements(p_members)
    loop
      insert into public.household_members (
        household_id,
        name,
        relation,
        age,
        is_primary,
        photo_url
      ) values (
        v_hid,
        coalesce(v_member->>'name', p_primary_name),
        coalesce(nullif(v_member->>'relation', ''), 'Family'),
        nullif(v_member->>'age', '')::int,
        coalesce((v_member->>'isPrimary')::boolean, v_idx = 0),
        nullif(v_member->>'photo', '')
      );
      v_idx := v_idx + 1;
    end loop;
  end if;

  if v_idx = 0 then
    insert into public.household_members (household_id, name, relation, is_primary, photo_url)
    values (v_hid, p_primary_name, 'Head of household', true, nullif(p_photo_url, ''));
  end if;

  update public.profiles
  set
    name = p_primary_name,
    email = lower(trim(p_email)),
    phone = nullif(p_phone, ''),
    avatar_url = coalesce(nullif(p_avatar_url, ''), nullif(p_photo_url, ''), avatar_url),
    household_id = v_hid,
    role = 'member'
  where id = v_uid;

  return v_hid;
end;
$$;

revoke all on function public.register_household(
  text, text, text, text, text, text, text, text, text, text, text, jsonb
) from public;
grant execute on function public.register_household(
  text, text, text, text, text, text, text, text, text, text, text, jsonb
) to authenticated;
