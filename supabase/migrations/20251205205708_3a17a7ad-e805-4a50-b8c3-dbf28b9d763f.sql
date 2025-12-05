-- Create organizer payment settings table
CREATE TABLE public.organizer_payment_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  mpesa_shortcode TEXT,
  mpesa_api_key TEXT,
  mpesa_api_secret TEXT,
  mpesa_passkey TEXT,
  mpesa_callback_url TEXT,
  paypal_email TEXT,
  paypal_connected BOOLEAN DEFAULT FALSE,
  stripe_connected BOOLEAN DEFAULT FALSE,
  payment_setup_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organizer_id)
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL REFERENCES public.organizers(id) ON DELETE CASCADE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  organizer_payout NUMERIC NOT NULL,
  payout_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  payout_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create platform settings table for commission
CREATE TABLE public.platform_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default commission rate
INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES ('commission_rate', '10', 'Platform commission percentage');

INSERT INTO public.platform_settings (setting_key, setting_value, description)
VALUES ('payment_mode', 'test', 'Payment mode: test or live');

-- Enable RLS
ALTER TABLE public.organizer_payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizer_payment_settings
CREATE POLICY "Organizers can view own payment settings"
ON public.organizer_payment_settings FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organizers WHERE organizers.id = organizer_payment_settings.organizer_id 
  AND organizers.user_id = auth.uid()
));

CREATE POLICY "Organizers can insert own payment settings"
ON public.organizer_payment_settings FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM organizers WHERE organizers.id = organizer_payment_settings.organizer_id 
  AND organizers.user_id = auth.uid()
));

CREATE POLICY "Organizers can update own payment settings"
ON public.organizer_payment_settings FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM organizers WHERE organizers.id = organizer_payment_settings.organizer_id 
  AND organizers.user_id = auth.uid()
));

-- RLS Policies for payouts
CREATE POLICY "Organizers can view own payouts"
ON public.payouts FOR SELECT
USING (EXISTS (
  SELECT 1 FROM organizers WHERE organizers.id = payouts.organizer_id 
  AND organizers.user_id = auth.uid()
));

CREATE POLICY "Admins can view all payouts"
ON public.payouts FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all payouts"
ON public.payouts FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for platform_settings
CREATE POLICY "Anyone can view platform settings"
ON public.platform_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage platform settings"
ON public.platform_settings FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Update trigger for timestamps
CREATE TRIGGER update_organizer_payment_settings_updated_at
BEFORE UPDATE ON public.organizer_payment_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_platform_settings_updated_at
BEFORE UPDATE ON public.platform_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();