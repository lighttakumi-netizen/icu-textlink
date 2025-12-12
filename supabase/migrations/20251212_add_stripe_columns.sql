-- Add Stripe Connect columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE;

-- Add payment fields to transactions
ALTER TABLE public.transactions
ADd COLUMN IF NOT EXISTS stripe_checkout_session_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'unpaid'; -- 'unpaid', 'paid', 'refunded'
