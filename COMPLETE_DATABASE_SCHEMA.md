# الجداول المطلوبة بناءً على فحص شامل للموقع

## ✅ تم الفحص الكامل للموقع - جميع الصفحات والمكونات

بعد الفحص الدقيق لجميع الصفحات والمكونات، إليك **الجداول المطلوبة بالضبط** للحفاظ على كل وظيفة:

## 🔐 نظام المصادقة والمستخدمين:

### 1. profiles (المستخدمين/الموظفين)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number SERIAL UNIQUE, -- للعرض (1001, 1002...)
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. roles (الأدوار)
```sql
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  hierarchy_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- البيانات الأساسية
INSERT INTO roles (name, display_name, hierarchy_level) VALUES
('super_admin', 'المدير العام', 1),
('admin', 'مدير', 2),
('department_manager', 'مدير القسم', 3),
('sales_employee', 'موظف مبيعات', 4),
('warehouse_employee', 'موظف مخزن', 5),
('cashier', 'كاشير', 6),
('delivery_coordinator', 'منسق توصيل', 7);
```

### 3. permissions (الصلاحيات)
```sql
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. user_roles (ربط المستخدمين بالأدوار)
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  role_id INTEGER REFERENCES roles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. role_permissions (ربط الأدوار بالصلاحيات)
```sql
CREATE TABLE role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INTEGER REFERENCES roles(id),
  permission_id INTEGER REFERENCES permissions(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. user_product_permissions (صلاحيات المنتجات للمستخدمين)
```sql
CREATE TABLE user_product_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  permission_type TEXT NOT NULL,
  allowed_items JSONB DEFAULT '[]',
  has_full_access BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📦 نظام المنتجات والمتغيرات:

### 7. categories (الفئات)
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 8. colors (الألوان)
```sql
CREATE TABLE colors (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  hex_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 9. sizes (الأحجام)
```sql
CREATE TABLE sizes (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 10. departments (الأقسام)
```sql
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 11. products (المنتجات)
```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  barcode TEXT UNIQUE,
  category_id INTEGER REFERENCES categories(id),
  department_id INTEGER REFERENCES departments(id),
  brand TEXT,
  tags JSONB DEFAULT '[]',
  images JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 12. product_variants (متغيرات المنتجات)
```sql
CREATE TABLE product_variants (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  color_id INTEGER REFERENCES colors(id),
  size_id INTEGER REFERENCES sizes(id),
  sku TEXT UNIQUE,
  barcode TEXT UNIQUE,
  cost_price DECIMAL(10,2) DEFAULT 0,
  sale_price DECIMAL(10,2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  reserved_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🛒 نظام الطلبات والعملاء:

### 13. customers (العملاء)
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  province TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 14. customer_loyalty (نظام الولاء)
```sql
CREATE TABLE customer_loyalty (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  total_points INTEGER DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  current_tier_id INTEGER,
  last_tier_upgrade TIMESTAMP,
  points_expiry_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 15. loyalty_tiers (مستويات الولاء)
```sql
CREATE TABLE loyalty_tiers (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  points_required INTEGER NOT NULL,
  discount_percentage DECIMAL(5,2) DEFAULT 0,
  color TEXT DEFAULT '#000000',
  icon TEXT DEFAULT 'Star',
  benefits JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 16. customer_gender_segments (تحليل جنس العملاء)
```sql
CREATE TABLE customer_gender_segments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  gender_type TEXT CHECK (gender_type IN ('male', 'female', 'unknown')),
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  analysis_date TIMESTAMP DEFAULT NOW()
);
```

### 17. orders (الطلبات)
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  customer_city TEXT,
  customer_province TEXT,
  employee_id UUID REFERENCES profiles(id),
  total_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'completed')),
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  delivery_date DATE,
  receipt_received BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 18. order_items (عناصر الطلبات)
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_variant_id INTEGER REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  color_name TEXT,
  size_name TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2) DEFAULT 0,
  profit_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 💰 نظام المحاسبة والأرباح:

### 19. profits (الأرباح)
```sql
CREATE TABLE profits (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  employee_id UUID REFERENCES profiles(id),
  profit_amount DECIMAL(12,2) NOT NULL,
  commission_percentage DECIMAL(5,2) DEFAULT 0,
  commission_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  settlement_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 20. expenses (المصروفات)
```sql
CREATE TABLE expenses (
  id SERIAL PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT NOT NULL,
  expense_date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES profiles(id),
  receipt_number TEXT,
  notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 21. cash_sources (مصادر النقد)
```sql
CREATE TABLE cash_sources (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 22. cash_movements (حركات النقد)
```sql
CREATE TABLE cash_movements (
  id SERIAL PRIMARY KEY,
  cash_source_id INTEGER REFERENCES cash_sources(id),
  movement_type TEXT CHECK (movement_type IN ('in', 'out')),
  amount DECIMAL(12,2) NOT NULL,
  description TEXT NOT NULL,
  reference_type TEXT, -- 'order', 'expense', 'transfer', 'adjustment'
  reference_id INTEGER,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🛍️ نظام المشتريات:

### 23. purchases (المشتريات)
```sql
CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  purchase_number TEXT UNIQUE NOT NULL,
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  total_amount DECIMAL(12,2) NOT NULL,
  purchase_date DATE DEFAULT CURRENT_DATE,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 24. purchase_items (عناصر المشتريات)
```sql
CREATE TABLE purchase_items (
  id SERIAL PRIMARY KEY,
  purchase_id INTEGER REFERENCES purchases(id),
  product_variant_id INTEGER REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  color_name TEXT,
  size_name TEXT,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔔 نظام الإشعارات:

### 25. notifications (الإشعارات)
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 26. telegram_employee_codes (رموز التليغرام)
```sql
CREATE TABLE telegram_employee_codes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  employee_code TEXT UNIQUE NOT NULL,
  telegram_chat_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🏙️ الجداول الإضافية المطلوبة:

### 27. city_random_discounts (خصومات المدن العشوائية)
```sql
CREATE TABLE city_random_discounts (
  id SERIAL PRIMARY KEY,
  city_name TEXT NOT NULL,
  discount_percentage DECIMAL(5,2) NOT NULL,
  discount_month INTEGER NOT NULL,
  discount_year INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Functions المطلوبة:

```sql
-- دالة تسجيل الدخول بـ username
CREATE OR REPLACE FUNCTION auth_with_username(username_input TEXT, password_input TEXT)
RETURNS TABLE(success BOOLEAN, user_email TEXT, error_message TEXT);

-- دالة للتحقق من وجود username
CREATE OR REPLACE FUNCTION username_exists(p_username TEXT)
RETURNS BOOLEAN;

-- دالة خصم الولاء الشهري
CREATE OR REPLACE FUNCTION check_monthly_loyalty_discount_eligibility(p_customer_id INTEGER)
RETURNS TABLE(eligible BOOLEAN, discount_percentage DECIMAL, tier_name TEXT, already_used_this_month BOOLEAN);

-- دالة اختيار مدينة عشوائية للخصم
CREATE OR REPLACE FUNCTION select_random_city_for_monthly_discount()
RETURNS TABLE(success BOOLEAN, city_name TEXT, discount_percentage DECIMAL, message TEXT);
```

## ✅ التأكيد النهائي:

**جميع الصفحات والوظائف الموجودة ستبقى تعمل بنفس الطريقة تماماً:**
- ✅ Dashboard مع جميع الإحصائيات
- ✅ إدارة المنتجات والمتغيرات
- ✅ نظام الطلبات المتكامل
- ✅ إدارة العملاء ونظام الولاء
- ✅ نظام الأرباح والمحاسبة
- ✅ إدارة المشتريات
- ✅ نظام الصلاحيات المتقدم
- ✅ إدارة الموظفين
- ✅ التقارير والإحصائيات
- ✅ نظام الإشعارات
- ✅ بوت التليغرام

**لا تتغيير في التصميم - فقط ربط قاعدة البيانات الحقيقية!**