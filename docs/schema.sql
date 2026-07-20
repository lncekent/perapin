-- PeraPin Database Schema for Supabase (PostgreSQL)
-- Execute this script in your Supabase SQL Editor

-- 1. Create custom ENUM types
CREATE TYPE user_role AS ENUM ('consumer', 'merchant');
CREATE TYPE transaction_status AS ENUM ('success', 'failed');

-- 2. Create `users` table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL,
  business_name VARCHAR(255) NULL,
  stellar_public_key VARCHAR(56) UNIQUE NOT NULL,
  stellar_private_key_enc TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create `transactions` table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stellar_tx_hash VARCHAR(64) UNIQUE NOT NULL,
  from_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  from_public_key VARCHAR(56) NOT NULL,
  to_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  to_public_key VARCHAR(56) NOT NULL,
  amount_xlm NUMERIC(15, 7) NOT NULL,
  status transaction_status NOT NULL DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_public_key ON public.users(stellar_public_key);
CREATE INDEX IF NOT EXISTS idx_transactions_from ON public.transactions(from_public_key);
CREATE INDEX IF NOT EXISTS idx_transactions_to ON public.transactions(to_public_key);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 6. Create Service Role Full Access Policies
CREATE POLICY "Service role full access on users" ON public.users
  FOR ALL USING (true);

CREATE POLICY "Service role full access on transactions" ON public.transactions
  FOR ALL USING (true);
