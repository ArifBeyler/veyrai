-- ============================================================
-- fal.ai Kling Kolors v1.5 Try-On Integration
-- ============================================================

-- Enable extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- TRY-ON JOBS TABLE
-- ============================================================
create table if not exists public.tryon_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- Inputs stored as storage paths (private buckets)
  human_image_path text not null,
  garment_image_path text not null,

  -- fal.ai queue
  fal_request_id text,
  status text not null default 'QUEUED' check (status in ('QUEUED','IN_PROGRESS','COMPLETED','FAILED')),
  error_message text,

  -- bookkeeping
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for faster user queries
create index if not exists idx_tryon_jobs_user_id on public.tryon_jobs(user_id);
create index if not exists idx_tryon_jobs_status on public.tryon_jobs(status);
create index if not exists idx_tryon_jobs_fal_request_id on public.tryon_jobs(fal_request_id);

-- ============================================================
-- TRY-ON RESULTS TABLE
-- ============================================================
create table if not exists public.tryon_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.tryon_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,

  result_image_path text not null,
  result_thumb_path text,

  created_at timestamptz not null default now()
);

-- Index for faster lookups
create index if not exists idx_tryon_results_job_id on public.tryon_results(job_id);
create index if not exists idx_tryon_results_user_id on public.tryon_results(user_id);

-- ============================================================
-- USER CREDITS TABLE (MVP)
-- ============================================================
create table if not exists public.user_credits (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance int not null default 1,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger for tryon_jobs
drop trigger if exists trg_tryon_jobs_updated_at on public.tryon_jobs;
create trigger trg_tryon_jobs_updated_at
before update on public.tryon_jobs
for each row execute function public.set_updated_at();

-- Trigger for user_credits
drop trigger if exists trg_user_credits_updated_at on public.user_credits;
create trigger trg_user_credits_updated_at
before update on public.user_credits
for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS
alter table public.tryon_jobs enable row level security;
alter table public.tryon_results enable row level security;
alter table public.user_credits enable row level security;

-- TRYON_JOBS policies
-- Users can view their own jobs
create policy "Users can view own jobs"
  on public.tryon_jobs for select
  using (auth.uid() = user_id);

-- Users can insert their own jobs
create policy "Users can insert own jobs"
  on public.tryon_jobs for insert
  with check (auth.uid() = user_id);

-- Service role can update any job (for Edge Functions)
create policy "Service can update jobs"
  on public.tryon_jobs for update
  using (true);

-- TRYON_RESULTS policies
-- Users can view their own results
create policy "Users can view own results"
  on public.tryon_results for select
  using (auth.uid() = user_id);

-- Service role can insert results
create policy "Service can insert results"
  on public.tryon_results for insert
  with check (true);

-- USER_CREDITS policies
-- Users can view their own credits
create policy "Users can view own credits"
  on public.user_credits for select
  using (auth.uid() = user_id);

-- Users can insert their own credits (first time)
create policy "Users can insert own credits"
  on public.user_credits for insert
  with check (auth.uid() = user_id);

-- Service role can update credits
create policy "Service can update credits"
  on public.user_credits for update
  using (true);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to check/create user credits on first use
create or replace function public.ensure_user_credits(p_user_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  v_balance int;
begin
  -- Try to get existing balance
  select balance into v_balance
  from public.user_credits
  where user_id = p_user_id;

  -- If not exists, create with default balance
  if v_balance is null then
    insert into public.user_credits (user_id, balance)
    values (p_user_id, 1)
    on conflict (user_id) do nothing
    returning balance into v_balance;
    
    -- If insert failed due to race condition, select again
    if v_balance is null then
      select balance into v_balance
      from public.user_credits
      where user_id = p_user_id;
    end if;
  end if;

  return coalesce(v_balance, 0);
end;
$$;

-- Function to decrement credits atomically
create or replace function public.use_credit(p_user_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  v_new_balance int;
begin
  update public.user_credits
  set balance = balance - 1
  where user_id = p_user_id and balance > 0
  returning balance into v_new_balance;

  return v_new_balance is not null;
end;
$$;

-- ============================================================
-- STORAGE BUCKETS (run via Supabase Dashboard or CLI)
-- ============================================================
-- Note: Create these buckets manually or via CLI:
-- 1. human-images (private)
-- 2. garment-images (private)  
-- 3. tryon-results (private)

