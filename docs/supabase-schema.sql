-- Run this in the Supabase SQL editor before enabling production registration.
-- Supabase Auth owns auth.users; public.users extends it with PeraPin wallet data.

create type public.user_role as enum ('consumer', 'merchant');
create type public.transaction_status as enum ('success', 'failed');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  role public.user_role not null,
  business_name text,
  stellar_public_key text not null unique,
  stellar_private_key_enc text not null,
  pin_registered_at timestamptz,
  created_at timestamptz not null default now(),
  last_login timestamptz
);

create table if not exists public.transactions (
  id uuid primary key,
  stellar_tx_hash text not null unique,
  from_user_id uuid not null references public.users(id),
  from_public_key text not null,
  to_user_id uuid not null references public.users(id),
  to_public_key text not null,
  amount_xlm numeric(20, 7) not null check (amount_xlm > 0),
  status public.transaction_status not null,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id uuid primary key,
  user_id uuid references public.users(id) on delete set null,
  role public.user_role not null,
  rating smallint not null check (rating between 1 and 5),
  comments text not null check (char_length(comments) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.feedback enable row level security;

-- Browser clients do not access these tables directly. The API uses the service-role
-- key server-side. These policies permit a signed-in user to read only their own data
-- if a future read-only browser feature needs it.
create policy "users_read_own" on public.users for select to authenticated using (id = auth.uid());
create policy "transactions_read_own" on public.transactions for select to authenticated using (from_user_id = auth.uid() or to_user_id = auth.uid());
create policy "feedback_insert_own" on public.feedback for insert to authenticated with check (user_id = auth.uid());
