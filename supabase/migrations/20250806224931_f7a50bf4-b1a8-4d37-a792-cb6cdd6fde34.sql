-- إنشاء النظام المالي المتكامل

-- 1. جدول الإعدادات العامة
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. جدول مصادر الأموال (القاصة، البنك، إلخ)
CREATE TABLE IF NOT EXISTS public.cash_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'cash', -- cash, bank, digital_wallet
  current_balance NUMERIC NOT NULL DEFAULT 0,
  initial_balance NUMERIC NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. جدول حركات النقد (Cash Flow)
CREATE TABLE IF NOT EXISTS public.cash_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_source_id UUID NOT NULL REFERENCES public.cash_sources(id),
  movement_type TEXT NOT NULL, -- 'in' or 'out'
  amount NUMERIC NOT NULL,
  reference_type TEXT NOT NULL, -- 'purchase', 'order', 'expense', 'capital_injection', 'withdrawal'
  reference_id UUID,
  description TEXT NOT NULL,
  balance_before NUMERIC NOT NULL DEFAULT 0,
  balance_after NUMERIC NOT NULL DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إضافة RLS للإعدادات
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.settings
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- إضافة RLS لمصادر النقد
ALTER TABLE public.cash_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view cash sources" ON public.cash_sources
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage cash sources" ON public.cash_sources
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- إضافة RLS لحركات النقد
ALTER TABLE public.cash_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view cash movements" ON public.cash_movements
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert cash movements" ON public.cash_movements
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_cash_movements_source_id ON public.cash_movements(cash_source_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_type ON public.cash_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_cash_movements_reference ON public.cash_movements(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_cash_movements_created_at ON public.cash_movements(created_at);

-- إضافة trigger للتحديث التلقائي للأوقات
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cash_sources_updated_at
  BEFORE UPDATE ON public.cash_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة البيانات الأولية
INSERT INTO public.settings (key, value, description) VALUES
  ('initial_capital', '1000000', 'رأس المال الابتدائي للنظام'),
  ('company_name', '"شركة ريوس للتجارة"', 'اسم الشركة'),
  ('currency', '"IQD"', 'العملة المستخدمة')
ON CONFLICT (key) DO NOTHING;

-- إضافة القاصة الرئيسية
INSERT INTO public.cash_sources (name, type, current_balance, initial_balance, description) VALUES
  ('القاصة الرئيسية', 'cash', 1000000, 1000000, 'القاصة الأساسية للنظام')
ON CONFLICT DO NOTHING;

-- إنشاء دوال مساعدة للعمليات المالية
CREATE OR REPLACE FUNCTION public.add_cash_to_source(
  source_id UUID,
  amount NUMERIC,
  description TEXT,
  reference_type TEXT DEFAULT 'manual',
  reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  -- تحديث رصيد المصدر
  UPDATE public.cash_sources 
  SET current_balance = current_balance + amount,
      updated_at = now()
  WHERE id = source_id;
  
  -- إضافة حركة نقدية
  INSERT INTO public.cash_movements (
    cash_source_id, movement_type, amount, description, 
    reference_type, reference_id, balance_before, balance_after, created_by
  ) 
  SELECT 
    source_id, 'in', amount, description,
    reference_type, reference_id, 
    current_balance - amount, current_balance, auth.uid()
  FROM public.cash_sources 
  WHERE id = source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.withdraw_cash_from_source(
  source_id UUID,
  amount NUMERIC,
  description TEXT,
  reference_type TEXT DEFAULT 'manual',
  reference_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_balance_val NUMERIC;
BEGIN
  -- التحقق من الرصيد الحالي
  SELECT current_balance INTO current_balance_val 
  FROM public.cash_sources 
  WHERE id = source_id;
  
  IF current_balance_val < amount THEN
    RAISE EXCEPTION 'الرصيد غير كافي. الرصيد الحالي: %', current_balance_val;
  END IF;
  
  -- تحديث رصيد المصدر
  UPDATE public.cash_sources 
  SET current_balance = current_balance - amount,
      updated_at = now()
  WHERE id = source_id;
  
  -- إضافة حركة نقدية
  INSERT INTO public.cash_movements (
    cash_source_id, movement_type, amount, description, 
    reference_type, reference_id, balance_before, balance_after, created_by
  ) 
  SELECT 
    source_id, 'out', amount, description,
    reference_type, reference_id, 
    current_balance + amount, current_balance, auth.uid()
  FROM public.cash_sources 
  WHERE id = source_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة للحصول على الرصيد المحسن للقاصة الرئيسية
CREATE OR REPLACE FUNCTION public.get_enhanced_main_cash_balance()
RETURNS NUMERIC AS $$
DECLARE
  main_balance NUMERIC := 0;
  pending_orders_total NUMERIC := 0;
  delivered_orders_total NUMERIC := 0;
  total_expenses NUMERIC := 0;
  total_purchases NUMERIC := 0;
BEGIN
  -- الحصول على رصيد القاصة الرئيسية
  SELECT COALESCE(current_balance, 0) INTO main_balance
  FROM public.cash_sources 
  WHERE name = 'القاصة الرئيسية' AND is_active = true;
  
  -- حساب إجمالي الطلبات المعلقة (لم تستلم إيصالاتها)
  SELECT COALESCE(SUM(total_amount), 0) INTO pending_orders_total
  FROM public.orders 
  WHERE receipt_received = false AND status = 'delivered';
  
  -- حساب إجمالي الطلبات المستلمة (استلمت إيصالاتها)
  SELECT COALESCE(SUM(total_amount), 0) INTO delivered_orders_total
  FROM public.orders 
  WHERE receipt_received = true AND status = 'delivered';
  
  -- حساب إجمالي المصروفات
  SELECT COALESCE(SUM(amount), 0) INTO total_expenses
  FROM public.expenses;
  
  -- حساب إجمالي المشتريات
  SELECT COALESCE(SUM(total_amount), 0) INTO total_purchases
  FROM public.purchases;
  
  -- الرصيد المحسن = الرصيد الأساسي + الطلبات المستلمة - المصروفات - المشتريات
  RETURN main_balance + delivered_orders_total - total_expenses - total_purchases;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;