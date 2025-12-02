-- Fix foreign key constraints to allow user deletion

-- public.customers
alter table public.customers
drop constraint if exists customers_id_fkey;

alter table public.customers
add constraint customers_id_fkey
   foreign key (id)
   references auth.users(id)
   on delete cascade;

-- public.subscriptions
alter table public.subscriptions
drop constraint if exists subscriptions_user_id_fkey;

alter table public.subscriptions
add constraint subscriptions_user_id_fkey
   foreign key (user_id)
   references auth.users(id)
   on delete cascade;

-- public.token_usage
alter table public.token_usage
drop constraint if exists token_usage_user_id_fkey;

alter table public.token_usage
add constraint token_usage_user_id_fkey
   foreign key (user_id)
   references auth.users(id)
   on delete cascade;
