-- Create tables based on SPEC.md

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  email text unique not null,
  full_name text,
  student_id text unique,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TEXTBOOKS
create table public.textbooks (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  course_name text not null,
  condition text not null, -- 'S', 'A', 'B', 'C'
  description text,
  images text[], -- Array of URLs
  is_available boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- TRANSACTIONS
-- Status enum
create type transaction_status as enum ('pending', 'approved', 'paid', 'active', 'returned', 'completed', 'cancelled');

create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  book_id uuid references public.textbooks(id) not null,
  borrower_id uuid references public.profiles(id) not null,
  lender_id uuid references public.profiles(id) not null,
  start_date date not null,
  end_date date not null,
  amount integer not null, -- Total price in JPY
  fee_amount integer not null, -- Platform fee
  status transaction_status default 'pending' not null,
  stripe_payment_intent_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS
create table public.reviews (
  id uuid default uuid_generate_v4() primary key,
  transaction_id uuid references public.transactions(id) not null,
  reviewer_id uuid references public.profiles(id) not null,
  target_id uuid references public.profiles(id) not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.textbooks enable row level security;
alter table public.transactions enable row level security;
alter table public.reviews enable row level security;

-- POLICIES

-- Profiles: Public read, User update own
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Textbooks: Public read, Owner update/delete
create policy "Textbooks are viewable by everyone." on public.textbooks
  for select using (true);

create policy "Users can insert their own textbooks." on public.textbooks
  for insert with check ((select auth.uid()) = owner_id);

create policy "Users can update their own textbooks." on public.textbooks
  for update using ((select auth.uid()) = owner_id);

create policy "Users can delete their own textbooks." on public.textbooks
  for delete using ((select auth.uid()) = owner_id);

-- Transactions: Participants read/update
create policy "Users can see transactions they are involved in." on public.transactions
  for select using (
    (select auth.uid()) = borrower_id or
    (select auth.uid()) = lender_id
  );

create policy "Users can insert transactions." on public.transactions
  for insert with check (
    (select auth.uid()) = borrower_id
  );

create policy "Users can update transactions they are involved in." on public.transactions
  for update using (
    (select auth.uid()) = borrower_id or
    (select auth.uid()) = lender_id
  );

-- Reviews: Public read, Author update
create policy "Reviews are viewable by everyone." on public.reviews
  for select using (true);

create policy "Users can insert reviews." on public.reviews
  for insert with check ((select auth.uid()) = reviewer_id);

-- TRIGGER: Handle new user profile creation
-- This function is called when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE BUCKET
-- Note: Storage buckets usually need to be created in the dashboard or via API, but policies can be defined here if the bucket exists.
-- We assume a bucket named 'textbook_images' exists.
-- insert into storage.buckets (id, name) values ('textbook_images', 'textbook_images');
