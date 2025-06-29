/*
  # Create payment logs table for monitoring and auditing
  
  1. New Tables
    - `payment_logs`
      - `id` (uuid, primary key)
      - `amount` (bigint) - amount in cents
      - `currency` (text)
      - `customer_email` (text, nullable)
      - `success` (boolean)
      - `error_message` (text, nullable)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on `payment_logs` table
    - Add policy for service role to manage all logs
    - Add policy for authenticated users to read their own logs
    
  3. Indexes
    - Index on created_at for chronological queries
    - Index on customer_email for user-specific queries
    - Index on success for filtering successful/failed payments
*/

CREATE TABLE IF NOT EXISTS payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount bigint NOT NULL,
  currency text NOT NULL,
  customer_email text,
  success boolean NOT NULL DEFAULT false,
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage all logs
CREATE POLICY "Service role can manage payment logs"
  ON payment_logs
  FOR ALL
  TO service_role
  USING (true);

-- Policy for authenticated users to read their own logs
CREATE POLICY "Users can read own payment logs"
  ON payment_logs
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt() ->> 'email');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON payment_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_logs_customer_email ON payment_logs(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_logs_success ON payment_logs(success);
CREATE INDEX IF NOT EXISTS idx_payment_logs_currency ON payment_logs(currency);