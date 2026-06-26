-- Member QR token + staff scan points transaction audit.
-- The project uses public.customers as the member profile table.

create extension if not exists pgcrypto;

alter table public.customers
  add column if not exists qr_token text;

create unique index if not exists customers_qr_token_key
  on public.customers(qr_token)
  where qr_token is not null;

do $$
declare
  v_customer record;
  v_token text;
begin
  for v_customer in
    select id
      from public.customers
     where qr_token is null
  loop
    loop
      v_token := encode(gen_random_bytes(32), 'base64');
      v_token := replace(replace(replace(v_token, '+', '-'), '/', '_'), '=', '');
      exit when not exists (
        select 1
          from public.customers
         where qr_token = v_token
      );
    end loop;

    update public.customers
       set qr_token = v_token
     where id = v_customer.id;
  end loop;
end $$;

create table if not exists public.points_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  points integer not null,
  type text not null check (type in ('earn', 'redeem')),
  reason text,
  created_at timestamptz default now()
);

create index if not exists points_transactions_user_idx
  on public.points_transactions(user_id);

create index if not exists points_transactions_created_at_idx
  on public.points_transactions(created_at desc);

NOTIFY pgrst, 'reload schema';
