create table if not exists public.chat_messages (
    id uuid not null default gen_random_uuid(),
    document_id uuid not null references public.documents(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade,
    role text not null check (role in ('user', 'assistant')),
    content text not null,
    created_at timestamp with time zone not null default now(),
    constraint chat_messages_pkey primary key (id)
);

alter table public.chat_messages enable row level security;

create policy "Users can view chat messages for their documents"
    on public.chat_messages for select
    using (auth.uid() = user_id);

create policy "Users can insert chat messages for their documents"
    on public.chat_messages for insert
    with check (auth.uid() = user_id);

-- Add index for faster lookups
create index chat_messages_document_id_idx on public.chat_messages(document_id);
create index chat_messages_created_at_idx on public.chat_messages(created_at);
