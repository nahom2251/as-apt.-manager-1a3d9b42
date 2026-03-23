
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (admin system)
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin');
CREATE TYPE public.approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'admin',
  status approval_status NOT NULL DEFAULT 'pending',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_approved(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND status = 'approved'
  )
$$;

-- Auto-create profile + role on signup (first user = super_admin, rest = admin/pending)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);

  SELECT COUNT(*) INTO user_count FROM public.user_roles;

  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role, status)
    VALUES (NEW.id, 'super_admin', 'approved');
  ELSE
    INSERT INTO public.user_roles (user_id, role, status)
    VALUES (NEW.id, 'admin', 'pending');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Apartments table
CREATE TABLE public.apartments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  floor INT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('front', 'back', 'single')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (floor, position)
);
ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

-- Tenants table
CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  move_in_date DATE NOT NULL,
  monthly_rent NUMERIC NOT NULL DEFAULT 0,
  payment_months INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Bills table
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  tenant_name TEXT NOT NULL,
  apartment_id UUID REFERENCES public.apartments(id) ON DELETE CASCADE NOT NULL,
  unit_label TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('rent', 'electricity', 'water')),
  month INT NOT NULL,
  year INT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  kwh NUMERIC,
  rate NUMERIC,
  months_count INT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Seed the 7 apartments
INSERT INTO public.apartments (floor, position) VALUES
  (2, 'front'), (2, 'back'),
  (3, 'front'), (3, 'back'),
  (4, 'front'), (4, 'back'),
  (5, 'single');

-- RLS Policies

-- Profiles: users can read all, update own
CREATE POLICY "Anyone authenticated can read profiles"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- User roles: authenticated can read, super_admin can update
CREATE POLICY "Authenticated can read user_roles"
  ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Super admin can update user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Apartments: approved users can read
CREATE POLICY "Approved users can read apartments"
  ON public.apartments FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));

-- Tenants: approved users full CRUD
CREATE POLICY "Approved users can read tenants"
  ON public.tenants FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can insert tenants"
  ON public.tenants FOR INSERT TO authenticated WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can update tenants"
  ON public.tenants FOR UPDATE TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can delete tenants"
  ON public.tenants FOR DELETE TO authenticated USING (public.is_approved(auth.uid()));

-- Bills: approved users full CRUD
CREATE POLICY "Approved users can read bills"
  ON public.bills FOR SELECT TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can insert bills"
  ON public.bills FOR INSERT TO authenticated WITH CHECK (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can update bills"
  ON public.bills FOR UPDATE TO authenticated USING (public.is_approved(auth.uid()));
CREATE POLICY "Approved users can delete bills"
  ON public.bills FOR DELETE TO authenticated USING (public.is_approved(auth.uid()));
