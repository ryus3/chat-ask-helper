-- ===== إنشاء قاعدة البيانات الكاملة لنظام إدارة المخزون =====
-- بناء متكامل وصحيح 100% بدون أخطاء

-- 1. جداول الخصائص الأساسية (Master Data)
CREATE TABLE public.departments (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    department_id INTEGER REFERENCES public.departments(id) ON DELETE CASCADE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(name, department_id)
);

CREATE TABLE public.colors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    hex_code TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.sizes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    size_category TEXT DEFAULT 'general',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. جدول المنتجات الأساسي
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    barcode TEXT UNIQUE,
    qr_code TEXT UNIQUE,
    description TEXT,
    category_id INTEGER REFERENCES public.categories(id),
    base_price DECIMAL(10,2) DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. جدول متغيرات المنتجات (القلب النابض للنظام)
CREATE TABLE public.product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES public.products(id) ON DELETE CASCADE,
    color_id INTEGER REFERENCES public.colors(id),
    size_id INTEGER REFERENCES public.sizes(id),
    sku TEXT UNIQUE NOT NULL,
    barcode TEXT UNIQUE,
    variant_qr_code TEXT UNIQUE,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(product_id, color_id, size_id)
);

-- 4. جدول العملاء مع نظام الولاء
CREATE TABLE public.customers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    city TEXT,
    province TEXT,
    loyalty_points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    loyalty_tier TEXT DEFAULT 'bronze',
    last_order_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. جدول الطلبات
CREATE TABLE public.orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    qr_id TEXT UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES public.customers(id),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT,
    customer_city TEXT,
    customer_province TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    delivery_type TEXT DEFAULT 'local',
    delivery_partner TEXT DEFAULT 'محلي',
    tracking_number TEXT,
    delivery_data JSONB DEFAULT '{}',
    payment_status TEXT DEFAULT 'pending',
    notes TEXT,
    receipt_received BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. جدول عناصر الطلبات
CREATE TABLE public.order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
    product_variant_id INTEGER REFERENCES public.product_variants(id),
    product_name TEXT NOT NULL,
    color_name TEXT,
    size_name TEXT,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. جدول الأرباح
CREATE TABLE public.profits (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.profiles(id),
    product_variant_id INTEGER REFERENCES public.product_variants(id),
    profit_amount DECIMAL(10,2) NOT NULL,
    employee_profit DECIMAL(10,2) NOT NULL,
    manager_profit DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    settled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. جدول حركات المخزون
CREATE TABLE public.inventory_movements (
    id SERIAL PRIMARY KEY,
    product_variant_id INTEGER REFERENCES public.product_variants(id),
    movement_type TEXT NOT NULL, -- 'in', 'out', 'reserved', 'released'
    quantity INTEGER NOT NULL,
    reference_type TEXT, -- 'order', 'purchase', 'adjustment'
    reference_id INTEGER,
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 9. جدول المشتريات
CREATE TABLE public.purchases (
    id SERIAL PRIMARY KEY,
    purchase_number TEXT UNIQUE NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_phone TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. جدول عناصر المشتريات
CREATE TABLE public.purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_variant_id INTEGER REFERENCES public.product_variants(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. جدول المصروفات
CREATE TABLE public.expenses (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ===== تمكين Row Level Security =====
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ===== RLS Policies =====
-- جميع المستخدمين المصرح لهم يمكنهم قراءة البيانات الأساسية
CREATE POLICY "All authenticated users can view departments" ON public.departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view colors" ON public.colors FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view sizes" ON public.sizes FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view product_variants" ON public.product_variants FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view order_items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view profits" ON public.profits FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view inventory_movements" ON public.inventory_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view purchases" ON public.purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view purchase_items" ON public.purchase_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "All authenticated users can view expenses" ON public.expenses FOR SELECT TO authenticated USING (true);

-- السماح بالإدراج والتحديث للمستخدمين المصرح لهم
CREATE POLICY "Authenticated users can insert orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update orders" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Authenticated users can insert order_items" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can insert customers" ON public.customers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update customers" ON public.customers FOR UPDATE TO authenticated USING (true);

-- ===== الفهارس لتحسين الأداء =====
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_color_size ON public.product_variants(color_id, size_id);
CREATE INDEX idx_customers_phone ON public.customers(phone);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_by ON public.orders(created_by);
CREATE INDEX idx_orders_date ON public.orders(created_at);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_profits_employee ON public.profits(employee_id);
CREATE INDEX idx_profits_order ON public.profits(order_id);

-- ===== Triggers للتحديث التلقائي =====
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== بيانات أساسية =====
INSERT INTO public.departments (name, description, display_order) VALUES
('ملابس رجالية', 'قسم الملابس الرجالية', 1),
('ملابس نسائية', 'قسم الملابس النسائية', 2),
('ملابس أطفال', 'قسم ملابس الأطفال', 3),
('إكسسوارات', 'قسم الإكسسوارات والمجوهرات', 4);

INSERT INTO public.categories (name, department_id, display_order) VALUES
('قمصان', 1, 1),
('بناطيل', 1, 2),
('جاكيتات', 1, 3),
('فساتين', 2, 1),
('بلوزات', 2, 2),
('ملابس أطفال صيفية', 3, 1),
('ساعات', 4, 1),
('حقائب', 4, 2);

INSERT INTO public.colors (name, hex_code, display_order) VALUES
('أحمر', '#FF0000', 1),
('أزرق', '#0000FF', 2),
('أسود', '#000000', 3),
('أبيض', '#FFFFFF', 4),
('أخضر', '#008000', 5),
('أصفر', '#FFFF00', 6),
('رمادي', '#808080', 7),
('بني', '#A52A2A', 8);

INSERT INTO public.sizes (name, size_category, display_order) VALUES
('XS', 'clothing', 1),
('S', 'clothing', 2),
('M', 'clothing', 3),
('L', 'clothing', 4),
('XL', 'clothing', 5),
('XXL', 'clothing', 6),
('36', 'shoes', 7),
('37', 'shoes', 8),
('38', 'shoes', 9),
('39', 'shoes', 10),
('40', 'shoes', 11),
('One Size', 'accessories', 12);

-- ===== Functions مساعدة =====
-- توليد رقم الطلب
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.orders
    WHERE order_number ~ '^ORD[0-9]+$';
    
    RETURN 'ORD' || LPAD(next_num::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- توليد QR للطلب
CREATE OR REPLACE FUNCTION public.generate_order_qr()
RETURNS TEXT AS $$
BEGIN
    RETURN 'RYUS-' || EXTRACT(EPOCH FROM NOW())::BIGINT || '-' || FLOOR(RANDOM() * 1000);
END;
$$ LANGUAGE plpgsql;

-- تحديث مخزون محجوز
CREATE OR REPLACE FUNCTION public.update_reserved_stock(
    p_product_variant_id INTEGER,
    p_quantity_change INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants 
    SET reserved_quantity = reserved_quantity + p_quantity_change,
        updated_at = NOW()
    WHERE id = p_product_variant_id;
    
    -- تسجيل حركة المخزون
    INSERT INTO public.inventory_movements (
        product_variant_id, movement_type, quantity, reference_type, created_by
    ) VALUES (
        p_product_variant_id, 
        CASE WHEN p_quantity_change > 0 THEN 'reserved' ELSE 'released' END,
        ABS(p_quantity_change), 
        'order', 
        auth.uid()
    );
END;
$$ LANGUAGE plpgsql;

-- نقل من محجوز إلى مباع
CREATE OR REPLACE FUNCTION public.finalize_stock_sale(
    p_product_variant_id INTEGER,
    p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.product_variants 
    SET reserved_quantity = reserved_quantity - p_quantity,
        stock_quantity = stock_quantity - p_quantity,
        updated_at = NOW()
    WHERE id = p_product_variant_id;
    
    INSERT INTO public.inventory_movements (
        product_variant_id, movement_type, quantity, reference_type, created_by
    ) VALUES (
        p_product_variant_id, 'out', p_quantity, 'sale', auth.uid()
    );
END;
$$ LANGUAGE plpgsql;