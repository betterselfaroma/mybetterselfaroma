-- Reward products management for Admin and member redemption.
-- Idempotent: no table drops and no existing row deletion.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared auth helpers.
-- ---------------------------------------------------------------------------
create or replace function public.current_customer_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.id
    from public.customers c
   where c.auth_user_id = auth.uid()
      or lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
   order by case when c.auth_user_id = auth.uid() then 0 else 1 end
   limit 1
$$;

create or replace function public.is_staff_or_admin_user(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
      from public.customers c
     where (c.auth_user_id = p_user_id
        or lower(c.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
       and (
         coalesce(c.is_admin, false) = true
         or coalesce(c.role, 'member') in ('admin', 'staff')
       )
  )
$$;

-- ---------------------------------------------------------------------------
-- Products and redemption records.
-- ---------------------------------------------------------------------------
create table if not exists public.reward_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  points_cost integer not null default 0,
  stock integer not null default 0,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_by uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.reward_products
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists image_url text,
  add column if not exists points_cost integer default 0,
  add column if not exists stock integer default 0,
  add column if not exists active boolean default true,
  add column if not exists sort_order integer default 0,
  add column if not exists created_by uuid,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.reward_products
   set name = coalesce(nullif(name, ''), 'Reward product'),
       points_cost = greatest(coalesce(points_cost, 0), 0),
       stock = greatest(coalesce(stock, 0), 0),
       active = coalesce(active, true),
       sort_order = coalesce(sort_order, 0),
       created_at = coalesce(created_at, now()),
       updated_at = coalesce(updated_at, now());

alter table public.reward_products
  alter column name set not null,
  alter column points_cost set default 0,
  alter column points_cost set not null,
  alter column stock set default 0,
  alter column stock set not null,
  alter column active set default true,
  alter column active set not null,
  alter column sort_order set default 0,
  alter column sort_order set not null,
  alter column created_at set default now(),
  alter column updated_at set default now();

alter table public.reward_products drop constraint if exists reward_products_points_cost_check;
alter table public.reward_products
  add constraint reward_products_points_cost_check check (points_cost >= 0);

alter table public.reward_products drop constraint if exists reward_products_stock_check;
alter table public.reward_products
  add constraint reward_products_stock_check check (stock >= 0);

create index if not exists reward_products_active_sort_idx
  on public.reward_products(active, sort_order, created_at desc);

create index if not exists reward_products_created_by_idx
  on public.reward_products(created_by);

create table if not exists public.reward_redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid,
  product_id uuid,
  points_cost integer not null default 0,
  status text not null default 'pending',
  notes text,
  created_at timestamptz default now(),
  completed_at timestamptz
);

alter table public.reward_redemptions
  add column if not exists customer_id uuid,
  add column if not exists product_id uuid,
  add column if not exists reward_id uuid,
  add column if not exists points_cost integer default 0,
  add column if not exists points_used integer default 0,
  add column if not exists status text default 'pending',
  add column if not exists notes text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists completed_at timestamptz;

update public.reward_redemptions
   set points_cost = coalesce(nullif(points_cost, 0), points_used, 0),
       points_used = coalesce(nullif(points_used, 0), points_cost, 0),
       status = coalesce(nullif(status, ''), 'pending'),
       created_at = coalesce(created_at, now());

alter table public.reward_redemptions
  alter column points_cost set default 0,
  alter column points_cost set not null,
  alter column points_used set default 0,
  alter column points_used set not null,
  alter column reward_id drop not null,
  alter column status set default 'pending',
  alter column status set not null,
  alter column created_at set default now();

alter table public.reward_redemptions drop constraint if exists reward_redemptions_status_check;
alter table public.reward_redemptions
  add constraint reward_redemptions_status_check
  check (status in ('pending', 'approved', 'completed', 'cancelled'));

create index if not exists reward_redemptions_customer_idx
  on public.reward_redemptions(customer_id);

create index if not exists reward_redemptions_product_idx
  on public.reward_redemptions(product_id);

create index if not exists reward_redemptions_status_created_idx
  on public.reward_redemptions(status, created_at desc);

create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  points integer not null,
  type text not null,
  reason text,
  created_at timestamptz default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  details jsonb,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Storage bucket and policies.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'reward-products',
  'reward-products',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
   set public = true,
       file_size_limit = 5242880,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists reward_products_public_read on storage.objects;
create policy reward_products_public_read on storage.objects
  for select
  using (bucket_id = 'reward-products');

drop policy if exists reward_products_staff_insert on storage.objects;
create policy reward_products_staff_insert on storage.objects
  for insert
  with check (bucket_id = 'reward-products' and public.is_staff_or_admin_user());

drop policy if exists reward_products_staff_update on storage.objects;
create policy reward_products_staff_update on storage.objects
  for update
  using (bucket_id = 'reward-products' and public.is_staff_or_admin_user())
  with check (bucket_id = 'reward-products' and public.is_staff_or_admin_user());

drop policy if exists reward_products_staff_delete on storage.objects;
create policy reward_products_staff_delete on storage.objects
  for delete
  using (bucket_id = 'reward-products' and public.is_staff_or_admin_user());

-- ---------------------------------------------------------------------------
-- RLS.
-- ---------------------------------------------------------------------------
alter table public.reward_products enable row level security;
alter table public.reward_redemptions enable row level security;

drop policy if exists reward_products_active_select on public.reward_products;
create policy reward_products_active_select on public.reward_products
  for select
  using (active = true or public.is_staff_or_admin_user());

drop policy if exists reward_products_staff_insert on public.reward_products;
create policy reward_products_staff_insert on public.reward_products
  for insert
  with check (public.is_staff_or_admin_user());

drop policy if exists reward_products_staff_update on public.reward_products;
create policy reward_products_staff_update on public.reward_products
  for update
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists reward_products_staff_delete on public.reward_products;
create policy reward_products_staff_delete on public.reward_products
  for delete
  using (public.is_staff_or_admin_user());

drop policy if exists reward_redemptions_self_select on public.reward_redemptions;
create policy reward_redemptions_self_select on public.reward_redemptions
  for select
  using (customer_id = public.current_customer_id() or public.is_staff_or_admin_user());

drop policy if exists reward_redemptions_staff_update on public.reward_redemptions;
create policy reward_redemptions_staff_update on public.reward_redemptions
  for update
  using (public.is_staff_or_admin_user())
  with check (public.is_staff_or_admin_user());

drop policy if exists reward_redemptions_staff_insert on public.reward_redemptions;
create policy reward_redemptions_staff_insert on public.reward_redemptions
  for insert
  with check (public.is_staff_or_admin_user());

-- ---------------------------------------------------------------------------
-- Atomic member redemption.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_reward_product(product_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer public.customers%rowtype;
  v_product public.reward_products%rowtype;
  v_redemption_id uuid;
  v_next_points integer;
begin
  if product_id is null then
    raise exception 'invalid_product';
  end if;

  select *
    into v_customer
    from public.customers
   where auth_user_id = auth.uid()
      or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
   order by case when auth_user_id = auth.uid() then 0 else 1 end
   limit 1
   for update;

  if v_customer.id is null then
    raise exception 'member_profile_not_found';
  end if;

  select *
    into v_product
    from public.reward_products
   where id = product_id
   for update;

  if v_product.id is null or not coalesce(v_product.active, false) then
    raise exception 'reward_product_not_available';
  end if;

  if coalesce(v_product.stock, 0) <= 0 then
    raise exception 'reward_product_out_of_stock';
  end if;

  if coalesce(v_product.points_cost, 0) <= 0 then
    raise exception 'invalid_reward_points_cost';
  end if;

  v_next_points := coalesce(v_customer.points_balance, v_customer.points, 0) - v_product.points_cost;
  if v_next_points < 0 then
    raise exception 'insufficient_points';
  end if;

  update public.customers
     set points_balance = v_next_points,
         points = v_next_points
   where id = v_customer.id;

  update public.reward_products
     set stock = stock - 1,
         updated_at = now()
   where id = v_product.id;

  insert into public.reward_redemptions(customer_id, product_id, points_cost, points_used, status, notes)
  values (v_customer.id, v_product.id, v_product.points_cost, v_product.points_cost, 'pending', v_product.name)
  returning id into v_redemption_id;

  insert into public.points_transactions(user_id, points, type, reason)
  values (coalesce(v_customer.auth_user_id, v_customer.id), -v_product.points_cost, 'redeem', 'Redeemed reward product: ' || v_product.name);

  if to_regclass('public.points_ledger') is not null then
    insert into public.points_ledger(customer_id, points, type, description)
    values (v_customer.id, -v_product.points_cost, 'redeem', 'Redeemed reward product: ' || v_product.name);
  end if;

  insert into public.admin_audit_logs(admin_user_id, action, target_table, target_id, details)
  values (
    v_customer.auth_user_id,
    'member_redeem_reward_product',
    'reward_redemptions',
    v_redemption_id,
    jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'points_cost', v_product.points_cost,
      'remaining_points', v_next_points
    )
  );

  return v_redemption_id;
end;
$$;

grant execute on function public.redeem_reward_product(uuid) to authenticated, service_role;

notify pgrst, 'reload schema';
