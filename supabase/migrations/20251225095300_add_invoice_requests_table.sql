-- Create invoice_requests table for tracking email invoice requests
CREATE TABLE IF NOT EXISTS public.invoice_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  plan_name text NOT NULL,
  billing_cycle text NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'expired')),
  invoice_number text,
  payment_proof_url text,
  paid_at timestamptz,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  due_date timestamptz,
  notes text
);

-- Create indexes for better query performance
CREATE INDEX idx_invoice_requests_user_id ON public.invoice_requests(user_id);
CREATE INDEX idx_invoice_requests_email ON public.invoice_requests(email);
CREATE INDEX idx_invoice_requests_status ON public.invoice_requests(status);
CREATE INDEX idx_invoice_requests_created_at ON public.invoice_requests(created_at);

-- Add RLS policies
ALTER TABLE public.invoice_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own invoice requests
CREATE POLICY users_view_own_invoice_requests ON public.invoice_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Users can create their own invoice requests
CREATE POLICY users_create_own_invoice_requests ON public.invoice_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update their own invoice requests
CREATE POLICY users_update_own_invoice_requests ON public.invoice_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can view all invoice requests
CREATE POLICY admins_view_all_invoice_requests ON public.invoice_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'ceo')
    )
  );

-- Policy: Admins can update any invoice request
CREATE POLICY admins_update_all_invoice_requests ON public.invoice_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'ceo')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'ceo')
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoice_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_requests_updated_at
  BEFORE UPDATE ON public.invoice_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_requests_updated_at();

-- Create function to check and update expired invoices
CREATE OR REPLACE FUNCTION check_expired_invoices()
RETURNS void AS $$
BEGIN
  UPDATE public.invoice_requests
  SET status = 'expired'
  WHERE status = 'pending'
    AND due_date < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION check_expired_invoices() TO authenticated;

-- Comment on table
COMMENT ON TABLE public.invoice_requests IS 'Stores email invoice requests for users who prefer alternative payment methods';