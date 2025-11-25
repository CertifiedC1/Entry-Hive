-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'customer');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.payment_method AS ENUM ('mpesa', 'stripe', 'paypal');
CREATE TYPE public.ticket_status AS ENUM ('valid', 'used', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create organizers table
CREATE TABLE public.organizers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id UUID REFERENCES public.organizers(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  banner_url TEXT,
  venue TEXT NOT NULL,
  location TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  published BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  total_capacity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_category ON public.events(category_id);
CREATE INDEX idx_events_organizer ON public.events(organizer_id);
CREATE INDEX idx_events_published ON public.events(published);

-- Create ticket_types table
CREATE TABLE public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  quantity_available INTEGER NOT NULL,
  quantity_sold INTEGER DEFAULT 0,
  sale_start_date TIMESTAMPTZ,
  sale_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method payment_method NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  transaction_id TEXT UNIQUE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_payments_user ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(payment_status);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  ticket_type_id UUID REFERENCES public.ticket_types(id) ON DELETE CASCADE NOT NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  ticket_number TEXT NOT NULL UNIQUE,
  qr_code TEXT NOT NULL UNIQUE,
  status ticket_status DEFAULT 'valid',
  attendee_name TEXT,
  attendee_email TEXT,
  attendee_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_tickets_user ON public.tickets(user_id);
CREATE INDEX idx_tickets_event ON public.tickets(event_id);
CREATE INDEX idx_tickets_qr_code ON public.tickets(qr_code);

-- Create scans table
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE NOT NULL,
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scanned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location TEXT,
  device_info JSONB
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_organizers
  BEFORE UPDATE ON public.organizers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_events
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_ticket_types
  BEFORE UPDATE ON public.ticket_types
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for organizers
CREATE POLICY "Anyone can view verified organizers"
  ON public.organizers FOR SELECT
  USING (verified = true OR auth.uid() = user_id);

CREATE POLICY "Users can create organizer profile"
  ON public.organizers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Organizers can update own profile"
  ON public.organizers FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Anyone can view published events"
  ON public.events FOR SELECT
  USING (published = true OR EXISTS (
    SELECT 1 FROM public.organizers
    WHERE organizers.id = events.organizer_id
    AND organizers.user_id = auth.uid()
  ));

CREATE POLICY "Organizers can create events"
  ON public.events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.organizers
    WHERE organizers.id = organizer_id
    AND organizers.user_id = auth.uid()
  ));

CREATE POLICY "Organizers can update own events"
  ON public.events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.organizers
    WHERE organizers.id = events.organizer_id
    AND organizers.user_id = auth.uid()
  ));

CREATE POLICY "Organizers can delete own events"
  ON public.events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.organizers
    WHERE organizers.id = events.organizer_id
    AND organizers.user_id = auth.uid()
  ));

-- RLS Policies for ticket_types
CREATE POLICY "Anyone can view ticket types for published events"
  ON public.ticket_types FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.events
    WHERE events.id = ticket_types.event_id
    AND events.published = true
  ));

CREATE POLICY "Organizers can manage ticket types"
  ON public.ticket_types FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.events e
    JOIN public.organizers o ON e.organizer_id = o.id
    WHERE e.id = ticket_types.event_id
    AND o.user_id = auth.uid()
  ));

-- RLS Policies for payments
CREATE POLICY "Users can view own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create tickets"
  ON public.tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for scans
CREATE POLICY "Organizers can view scans for their events"
  ON public.scans FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.tickets t
    JOIN public.events e ON t.event_id = e.id
    JOIN public.organizers o ON e.organizer_id = o.id
    WHERE t.id = scans.ticket_id
    AND o.user_id = auth.uid()
  ));

CREATE POLICY "Authorized users can create scans"
  ON public.scans FOR INSERT
  WITH CHECK (auth.uid() = scanned_by);

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert default categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
  ('Music', 'music', 'Live music concerts and performances', '🎵'),
  ('Sports', 'sports', 'Sporting events and tournaments', '⚽'),
  ('Technology', 'technology', 'Tech conferences and workshops', '💻'),
  ('Business', 'business', 'Business conferences and networking', '💼'),
  ('Arts & Culture', 'arts-culture', 'Art exhibitions and cultural events', '🎨'),
  ('Food & Drink', 'food-drink', 'Food festivals and tasting events', '🍽️'),
  ('Education', 'education', 'Workshops and educational seminars', '📚'),
  ('Entertainment', 'entertainment', 'Comedy shows and entertainment', '🎭');