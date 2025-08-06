-- إصلاح التحذيرات الأمنية - إضافة search_path للدوال

-- تحديث دالة التحقق من اسم المستخدم
CREATE OR REPLACE FUNCTION public.username_exists(username_input TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username = username_input
  );
$$;

-- تحديث دالة جلب المستخدم بالاسم
CREATE OR REPLACE FUNCTION public.get_user_by_username(username_input TEXT)
RETURNS TABLE(user_id UUID, email TEXT, full_name TEXT, role TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, profiles.email, full_name, role
  FROM public.profiles 
  WHERE username = username_input AND is_active = true;
$$;

-- تحديث دالة التحقق من الصلاحيات
CREATE OR REPLACE FUNCTION public.user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_permissions 
    WHERE user_id = user_uuid 
    AND permission_type = permission_name 
    AND is_granted = true
  );
$$;

-- تحديث دالة تحديث التوقيت
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;