-- Tuitionly core schema (run via: npm run setup:db)
-- Statements are split on -- STATEMENT START / END markers (see setup-tables.mjs)

-- STATEMENT START:profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  phone TEXT,
  full_name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  plan TEXT NOT NULL DEFAULT 'free',
  max_students INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- STATEMENT END

-- STATEMENT START:students
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_name TEXT,
  parent_phone TEXT,
  monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- STATEMENT END

-- STATEMENT START:students_idx
CREATE INDEX IF NOT EXISTS students_user_id_idx ON public.students (user_id);
-- STATEMENT END

-- STATEMENT START:fee_payments
CREATE TABLE IF NOT EXISTS public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.students (id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
  billing_month DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- STATEMENT END

-- STATEMENT START:fee_payments_idx_user
CREATE INDEX IF NOT EXISTS fee_payments_user_id_idx ON public.fee_payments (user_id);
-- STATEMENT END

-- STATEMENT START:fee_payments_idx_student
CREATE INDEX IF NOT EXISTS fee_payments_student_id_idx ON public.fee_payments (student_id);
-- STATEMENT END

-- STATEMENT START:handle_new_user_fn
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
-- STATEMENT END

-- STATEMENT START:handle_new_user_trg_drop
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- STATEMENT END

-- STATEMENT START:handle_new_user_trg_create
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();
-- STATEMENT END

-- STATEMENT START:profiles_rls
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- STATEMENT END

-- STATEMENT START:profiles_pol_drop_select
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
-- STATEMENT END
-- STATEMENT START:profiles_pol_drop_update
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
-- STATEMENT END
-- STATEMENT START:profiles_pol_drop_insert
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
-- STATEMENT END
-- STATEMENT START:profiles_pol_create_select
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
-- STATEMENT END
-- STATEMENT START:profiles_pol_create_update
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- STATEMENT END
-- STATEMENT START:profiles_pol_create_insert
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
-- STATEMENT END

-- STATEMENT START:students_rls
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
-- STATEMENT END

-- STATEMENT START:students_pol_drop_select
DROP POLICY IF EXISTS "students_select_own" ON public.students;
-- STATEMENT END
-- STATEMENT START:students_pol_drop_insert
DROP POLICY IF EXISTS "students_insert_own" ON public.students;
-- STATEMENT END
-- STATEMENT START:students_pol_drop_update
DROP POLICY IF EXISTS "students_update_own" ON public.students;
-- STATEMENT END
-- STATEMENT START:students_pol_drop_delete
DROP POLICY IF EXISTS "students_delete_own" ON public.students;
-- STATEMENT END
-- STATEMENT START:students_pol_create_select
CREATE POLICY "students_select_own" ON public.students FOR SELECT USING (auth.uid() = user_id);
-- STATEMENT END
-- STATEMENT START:students_pol_create_insert
CREATE POLICY "students_insert_own" ON public.students FOR INSERT WITH CHECK (auth.uid() = user_id);
-- STATEMENT END
-- STATEMENT START:students_pol_create_update
CREATE POLICY "students_update_own" ON public.students FOR UPDATE USING (auth.uid() = user_id);
-- STATEMENT END
-- STATEMENT START:students_pol_create_delete
CREATE POLICY "students_delete_own" ON public.students FOR DELETE USING (auth.uid() = user_id);
-- STATEMENT END

-- STATEMENT START:fee_payments_rls
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
-- STATEMENT END

-- STATEMENT START:fee_pol_drop_select
DROP POLICY IF EXISTS "fee_payments_select_own" ON public.fee_payments;
-- STATEMENT END
-- STATEMENT START:fee_pol_drop_insert
DROP POLICY IF EXISTS "fee_payments_insert_own" ON public.fee_payments;
-- STATEMENT END
-- STATEMENT START:fee_pol_drop_update
DROP POLICY IF EXISTS "fee_payments_update_own" ON public.fee_payments;
-- STATEMENT END
-- STATEMENT START:fee_pol_drop_delete
DROP POLICY IF EXISTS "fee_payments_delete_own" ON public.fee_payments;
-- STATEMENT END
-- STATEMENT START:fee_pol_create_select
CREATE POLICY "fee_payments_select_own" ON public.fee_payments FOR SELECT USING (auth.uid() = user_id);
-- STATEMENT END
-- STATEMENT START:fee_pol_create_insert
CREATE POLICY "fee_payments_insert_own" ON public.fee_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
-- STATEMENT END
-- STATEMENT START:fee_pol_create_update
CREATE POLICY "fee_payments_update_own" ON public.fee_payments FOR UPDATE USING (auth.uid() = user_id);
-- STATEMENT END
-- STATEMENT START:fee_pol_create_delete
CREATE POLICY "fee_payments_delete_own" ON public.fee_payments FOR DELETE USING (auth.uid() = user_id);
-- STATEMENT END
