create table public.token_usage (
  user_id uuid references auth.users not null primary key,
  tokens_used bigint default 0,
  last_reset_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.token_usage enable row level security;

create policy "Can view own token usage." on public.token_usage
  for select using (auth.uid() = user_id);

create or replace function public.increment_token_usage(target_user_id uuid, amount bigint)
returns void
language plpgsql
security definer
as $$
begin
  update public.token_usage
  set tokens_used = tokens_used + amount
  where user_id = target_user_id;
end;
$$;

revoke execute on function public.increment_token_usage(uuid, bigint) from public;
grant execute on function public.increment_token_usage(uuid, bigint) to service_role;


