-- إنشاء النظام الموحد للمستخدمين والصلاحيات

-- جدول البيانات الشخصية للمستخدمين
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  employee_id INTEGER UNIQUE,
  employee_code TEXT,
  telegram_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- تفعيل RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- جدول صلاحيات المستخدمين
CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- 'view_all_data', 'manage_employees', 'manage_finances', etc.
  is_granted BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_type)
);

ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- جدول صلاحيات المنتجات للمستخدمين  
CREATE TABLE public.product_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_sell BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE public.product_permissions ENABLE ROW LEVEL SECURITY;

-- دالة للتحقق من اسم المستخدم
CREATE OR REPLACE FUNCTION public.username_exists(username_input TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = username_input
  );
$$;

-- دالة تسجيل الدخول باسم المستخدم
CREATE OR REPLACE FUNCTION public.get_user_by_username(username_input TEXT)
RETURNS TABLE(user_id UUID, email TEXT, full_name TEXT, role TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT id, profiles.email, full_name, role
  FROM public.profiles 
  WHERE username = username_input AND is_active = true;
$$;

-- دالة التحقق من الصلاحيات
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = user_uuid 
    AND permission_type = permission_name 
    AND is_granted = true
  );
$$;

-- دالة إنشاء بروفايل تلقائي عند التسجيل
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  next_employee_id INTEGER;
  is_first_user BOOLEAN;
BEGIN
  -- التحقق إذا كان هذا أول مستخدم
  SELECT COUNT(*) = 0 INTO is_first_user FROM public.profiles;
  
  -- توليد معرف الموظف
  SELECT COALESCE(MAX(employee_id), 1000) + 1 INTO next_employee_id FROM public.profiles;
  
  -- إنشاء البروفايل
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    email,
    role,
    employee_id,
    employee_code
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    NEW.email,
    CASE WHEN is_first_user THEN 'admin' ELSE 'employee' END,
    next_employee_id,
    'EMP' || LPAD(next_employee_id::text, 4, '0')
  );
  
  -- إعطاء صلاحيات كاملة للمدير الأول
  IF is_first_user THEN
    INSERT INTO public.user_permissions (user_id, permission_type, is_granted) VALUES
    (NEW.id, 'view_all_data', true),
    (NEW.id, 'manage_employees', true),
    (NEW.id, 'manage_finances', true),
    (NEW.id, 'manage_products', true),
    (NEW.id, 'manage_orders', true),
    (NEW.id, 'view_reports', true);
  END IF;
  
  RETURN NEW;
END;
$$;

-- تشغيل الدالة عند إنشاء مستخدم جديد
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- دالة تحديث التوقيت
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق التحديث التلقائي للوقت
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- سياسات الأمان
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles  
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- سياسات صلاحيات المستخدمين
CREATE POLICY "Users can view their own permissions" ON public.user_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON public.user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- سياسات صلاحيات المنتجات
CREATE POLICY "Users can view their own product permissions" ON public.product_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all product permissions" ON public.product_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );