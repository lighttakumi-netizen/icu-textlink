-- Add major column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS major VARCHAR(3);
