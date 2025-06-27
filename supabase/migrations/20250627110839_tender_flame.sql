/*
  # Create donations table for Stripe payments

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `stripe_session_id` (text, unique)
      - `amount` (bigint) - amount in cents
      - `currency` (text, default 'usd')
      - `customer_email` (text)
      - `status` (text, default 'pending')
      - `metadata` (jsonb) - for storing additional payment info
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `donations` table
    - Add policy for authenticated users to read their own donations
    - Add policy for service role to manage all donations

  3. Indexes
    - Index on stripe_session_id for fast lookups
    - Index on customer_email for user queries
    - Index on created_at for chronological sorting
*/

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id text UNIQUE NOT NULL,
  amount bigint NOT NULL,
  currency text DEFAULT 'usd',
  customer_email text,
  status text DEFAULT 'pending',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read their own donations
CREATE POLICY "Users can read own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt() ->> 'email');

-- Policy for service role to manage all donations (for webhooks)
CREATE POLICY "Service role can manage donations"
  ON donations
  FOR ALL
  TO service_role
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_donations_stripe_session_id ON donations(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_donations_customer_email ON donations(customer_email);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_donations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donations_updated_at();