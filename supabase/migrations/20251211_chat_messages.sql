-- Create MESSAGES table for Chat
create table if not exists public.messages (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies
-- Users can read messages for transactions they are involved in
create policy "Users can read messages in their transactions." on public.messages
  for select using (
    exists (
      select 1 from public.transactions t
      where t.id = messages.transaction_id
      and (t.borrower_id = (select auth.uid()) or t.lender_id = (select auth.uid()))
    )
  );

-- Users can insert messages if they are part of the transaction
create policy "Users can send messages in their transactions." on public.messages
  for insert with check (
    exists (
      select 1 from public.transactions t
      where t.id = messages.transaction_id
      and (t.borrower_id = (select auth.uid()) or t.lender_id = (select auth.uid()))
    )
    and sender_id = (select auth.uid())
  );
