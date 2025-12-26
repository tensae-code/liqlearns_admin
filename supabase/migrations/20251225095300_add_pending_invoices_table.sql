-- Create pending_invoices table for invoice tracking
CREATE TABLE IF NOT EXISTS public.pending_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled')),
  additional_info TEXT,
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX idx_pending_invoices_user_id ON public.pending_invoices(user_id);
CREATE INDEX idx_pending_invoices_status ON public.pending_invoices(status);
CREATE INDEX idx_pending_invoices_email ON public.pending_invoices(email);

-- Enable RLS
ALTER TABLE public.pending_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own invoices"
  ON public.pending_invoices
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all invoices"
  ON public.pending_invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'ceo')
    )
  );

CREATE POLICY "Admins can update invoices"
  ON public.pending_invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'ceo')
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_pending_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pending_invoices_updated_at
  BEFORE UPDATE ON public.pending_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_invoices_updated_at();

-- Function to check and activate paid invoices
CREATE OR REPLACE FUNCTION activate_student_after_invoice_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoice is marked as paid
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    -- Update student profile
    UPDATE public.student_profiles
    SET 
      has_active_subscription = true,
      subscription_start_date = NOW(),
      subscription_end_date = CASE 
        WHEN NEW.billing_cycle = 'monthly' THEN NOW() + INTERVAL '1 month'
        WHEN NEW.billing_cycle = 'yearly' THEN NOW() + INTERVAL '1 year'
      END
    WHERE id = NEW.user_id;

    -- Update user account status
    UPDATE public.user_profiles
    SET account_status = 'active'
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_activate_student_after_invoice_payment
  AFTER UPDATE ON public.pending_invoices
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND OLD.status = 'pending')
  EXECUTE FUNCTION activate_student_after_invoice_payment();