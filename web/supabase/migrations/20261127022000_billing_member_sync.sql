-- Let members record payment attempts / completed payments for their own household
drop policy if exists "txn member insert" on public.transactions;
create policy "txn member insert" on public.transactions
  for insert with check (
    public.current_role() = 'admin'
    or household_id in (select household_id from public.profiles where id = auth.uid())
  );

-- Members can update their own open requests? keep admin update only.
-- Tighten member_requests insert to own household
drop policy if exists "requests insert member" on public.member_requests;
create policy "requests insert member" on public.member_requests
  for insert with check (
    auth.uid() is not null
    and (
      public.current_role() = 'admin'
      or household_id in (select household_id from public.profiles where id = auth.uid())
    )
  );

-- Admin helper: mark invoice paid + write transaction in one shot
create or replace function public.mark_invoice_paid(
  p_invoice_id uuid,
  p_method text,
  p_reference text default null,
  p_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text := public.current_role();
  v_inv public.invoices%rowtype;
  v_txn_id uuid;
begin
  if v_role is distinct from 'admin' then
    raise exception 'Only admins can mark invoices paid';
  end if;

  select * into v_inv from public.invoices where id = p_invoice_id;
  if not found then
    raise exception 'Invoice not found';
  end if;

  update public.invoices
  set status = 'paid',
      paid_at = now(),
      updated_at = now()
  where id = p_invoice_id;

  insert into public.transactions (
    household_id, invoice_id, amount, method, status, reference, note
  ) values (
    v_inv.household_id,
    v_inv.id,
    v_inv.amount,
    coalesce(nullif(p_method, ''), 'other'),
    'completed',
    nullif(p_reference, ''),
    coalesce(nullif(p_note, ''), 'Payment for ' || v_inv.invoice_number)
  )
  returning id into v_txn_id;

  return v_txn_id;
end;
$$;

revoke all on function public.mark_invoice_paid(uuid, text, text, text) from public;
grant execute on function public.mark_invoice_paid(uuid, text, text, text) to authenticated;
