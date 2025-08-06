-- إصلاح مشكلة الحلقة اللا نهائية في سياسات الأمان
-- أولاً، حذف السياسات الحالية المعطلة
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- إنشاء دالة آمنة للتحقق من دور المستخدم بدون حلقة لا نهائية
CREATE OR REPLACE FUNCTION public.check_user_role(user_uuid uuid, required_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_uuid 
    AND role = required_role 
    AND is_active = true
  );
$$;

-- إنشاء سياسات أمان جديدة بدون حلقة لا نهائية
-- السماح للمستخدمين بعرض ملفهم الشخصي
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- السماح للمستخدمين بتحديث ملفهم الشخصي
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- السماح للمدراء بعرض جميع الملفات الشخصية
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- السماح للمستخدم برؤية ملفه الشخصي
  auth.uid() = id 
  OR 
  -- أو إذا كان مدير (استخدام دالة آمنة)
  public.check_user_role(auth.uid(), 'admin')
);

-- السماح للمدراء بإدارة جميع الملفات الشخصية
CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.check_user_role(auth.uid(), 'admin'));

-- السماح بإدراج الملفات الشخصية الجديدة (مطلوب للتسجيل)
CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- تحديث دالة handle_new_user لضمان عملها الصحيح
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  next_employee_id INTEGER;
  is_first_user BOOLEAN;
BEGIN
  -- التحقق إذا كان هذا أول مستخدم في النظام
  SELECT COUNT(*) = 0 INTO is_first_user 
  FROM public.profiles 
  WHERE is_active = true;
  
  -- توليد معرف الموظف الجديد
  SELECT COALESCE(MAX(employee_id), 1000) + 1 INTO next_employee_id 
  FROM public.profiles;
  
  -- إنشاء الملف الشخصي للمستخدم الجديد
  INSERT INTO public.profiles (
    id, 
    username, 
    full_name, 
    email,
    role,
    employee_id,
    employee_code,
    is_active
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || NEW.id::text),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'مستخدم جديد'),
    NEW.email,
    CASE WHEN is_first_user THEN 'admin' ELSE 'employee' END,
    next_employee_id,
    'EMP' || LPAD(next_employee_id::text, 4, '0'),
    CASE WHEN is_first_user THEN true ELSE false END -- أول مستخدم نشط، الباقي بحاجة موافقة
  );
  
  -- إعطاء صلاحيات كاملة للمدير الأول فقط
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