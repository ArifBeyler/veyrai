-- ============================================================
-- ADD CREDITS FUNCTION
-- Used when user purchases credits via RevenueCat
-- ============================================================

-- Function to add credits after purchase
create or replace function public.add_credits(p_user_id uuid, p_amount int)
returns int
language plpgsql
security definer
as $$
declare
  v_new_balance int;
begin
  -- Insert or update user credits
  insert into public.user_credits (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id) 
  do update set balance = user_credits.balance + p_amount
  returning balance into v_new_balance;

  return v_new_balance;
end;
$$;

-- Function to get user credits (creates if not exists)
create or replace function public.get_user_credits(p_user_id uuid)
returns int
language plpgsql
security definer
as $$
declare
  v_balance int;
begin
  -- Get existing balance or create with 0
  select balance into v_balance
  from public.user_credits
  where user_id = p_user_id;

  if v_balance is null then
    insert into public.user_credits (user_id, balance)
    values (p_user_id, 0)
    on conflict (user_id) do nothing
    returning balance into v_balance;
    
    if v_balance is null then
      select balance into v_balance
      from public.user_credits
      where user_id = p_user_id;
    end if;
  end if;

  return coalesce(v_balance, 0);
end;
$$;

