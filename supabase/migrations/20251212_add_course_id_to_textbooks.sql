-- Add course_id column to textbooks table
ALTER TABLE public.textbooks ADD COLUMN IF NOT EXISTS course_id VARCHAR(50);
