-- DFWSKPM — run once in Supabase → SQL Editor → New query → Run
-- Project: qmbaqzzldpfdhjtlgoce

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  email text not null default '',
  phone text,
  role text not null default 'member' check (role in ('admin', 'editor', 'member')),
  avatar_url text,
  household_id uuid,
  created_at timestamptz not null default now()
);

-- Households
create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  primary_name text not null,
  email text not null,
  phone text not null default '',
  address_line1 text not null default '',
  address_line2 text,
  city text not null default '',
  state text not null default 'TX',
  zip text not null default '',
  photo_url text,
  notes text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  source text check (source in ('signup', 'admin')),
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  drop constraint if exists profiles_household_id_fkey;
alter table public.profiles
  add constraint profiles_household_id_fkey
  foreign key (household_id) references public.households (id) on delete set null;

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  name text not null,
  relation text not null default 'Family',
  age int,
  is_primary boolean not null default false,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  invoice_number text not null,
  title text not null,
  description text not null default '',
  type text not null default 'other',
  amount numeric(12,2) not null,
  status text not null default 'open',
  due_date timestamptz not null,
  issued_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  invoice_id uuid references public.invoices (id) on delete set null,
  amount numeric(12,2) not null,
  method text not null default 'other',
  status text not null default 'completed',
  reference text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.member_requests (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  name text not null,
  email text not null,
  type text not null default 'general',
  subject text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  name text not null,
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  to_name text,
  household_id uuid references public.households (id) on delete set null,
  template_id uuid references public.email_templates (id) on delete set null,
  subject text not null,
  body text not null,
  status text not null default 'draft',
  created_by text,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.invoices enable row level security;
alter table public.transactions enable row level security;
alter table public.member_requests enable row level security;
alter table public.contact_messages enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_logs enable row level security;

create or replace function public.current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Profiles
drop policy if exists "profiles read own or staff" on public.profiles;
create policy "profiles read own or staff" on public.profiles
  for select using (
    id = auth.uid()
    or public.current_role() in ('admin', 'editor')
  );

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update using (id = auth.uid() or public.current_role() = 'admin');

-- Households: members see linked household; admins see all
drop policy if exists "households select" on public.households;
create policy "households select" on public.households
  for select using (
    public.current_role() = 'admin'
    or id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "households insert" on public.households;
create policy "households insert" on public.households
  for insert with check (
    public.current_role() = 'admin'
    or auth.uid() is not null
  );

drop policy if exists "households update" on public.households;
create policy "households update" on public.households
  for update using (
    public.current_role() = 'admin'
    or id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "households delete admin" on public.households;
create policy "households delete admin" on public.households
  for delete using (public.current_role() = 'admin');

-- Members / invoices / etc: admin full; household members read own
drop policy if exists "members select" on public.household_members;
create policy "members select" on public.household_members
  for select using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "members write" on public.household_members;
create policy "members write" on public.household_members
  for all using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "invoices select" on public.invoices;
create policy "invoices select" on public.invoices
  for select using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "invoices admin write" on public.invoices;
create policy "invoices admin write" on public.invoices
  for all using (public.current_role() = 'admin');

drop policy if exists "txn select" on public.transactions;
create policy "txn select" on public.transactions
  for select using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "txn admin write" on public.transactions;
create policy "txn admin write" on public.transactions
  for all using (public.current_role() = 'admin');

drop policy if exists "requests select" on public.member_requests;
create policy "requests select" on public.member_requests
  for select using (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
  );

drop policy if exists "requests insert member" on public.member_requests;
create policy "requests insert member" on public.member_requests
  for insert with check (auth.uid() is not null);

drop policy if exists "requests admin update" on public.member_requests;
create policy "requests admin update" on public.member_requests
  for update using (public.current_role() = 'admin');

drop policy if exists "contact insert public" on public.contact_messages;
create policy "contact insert public" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact admin" on public.contact_messages;
create policy "contact admin" on public.contact_messages
  for all using (public.current_role() = 'admin');

drop policy if exists "email templates staff" on public.email_templates;
create policy "email templates staff" on public.email_templates
  for all using (public.current_role() in ('admin', 'editor'));

drop policy if exists "email logs admin" on public.email_logs;
create policy "email logs admin" on public.email_logs
  for all using (public.current_role() = 'admin');

-- Storage bucket for profile photos (run after creating bucket "avatars" in Storage UI, public)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar read" on storage.objects;
create policy "avatar read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar upload own" on storage.objects;
create policy "avatar upload own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatar update own" on storage.objects;
create policy "avatar update own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Default email templates (idempotent)
insert into public.email_templates (key, name, subject, body)
select v.key, v.name, v.subject, v.body
from (
  values
    (
      'welcome',
      'Welcome after signup',
      'Pranam — welcome to {{templeName}}',
      E'Pranam {{name}},\n\nThank you for registering the {{familyName}} household with {{templeName}}.\n\nOur team will review your details shortly. You can sign in anytime to update family members, view invoices, and send requests.\n\nTemple: {{address}}\nPhone: {{phone}}\nEmail: {{email}}\n\nWith devotion,\n{{templeName}}'
    ),
    (
      'reviewed',
      'Household reviewed',
      'Your household is confirmed — {{templeName}}',
      E'Pranam {{name}},\n\nGood news — the {{familyName}} household has been reviewed and confirmed in our temple directory.\n\nSign in to your household portal for invoices, family details, and upcoming events.\n\n{{templeName}}\n{{phone}} · {{email}}'
    ),
    (
      'invoice',
      'Invoice reminder',
      'Invoice reminder — {{invoiceTitle}}',
      E'Pranam {{name}},\n\nThis is a friendly reminder about an open balance for the {{familyName}} household:\n\n{{invoiceTitle}}\nAmount: {{invoiceAmount}}\nDue: {{invoiceDue}}\n\nPlease sign in to your household portal to review details and arrange payment.\n\nThank you for your seva,\n{{templeName}}'
    ),
    (
      'general',
      'General notice',
      'Message from {{templeName}}',
      E'Pranam {{name}},\n\n{{message}}\n\nWith devotion,\n{{templeName}}\n{{phone}} · {{email}}'
    )
) as v(key, name, subject, body)
where not exists (
  select 1 from public.email_templates t where t.key = v.key
);
