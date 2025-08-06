
# الهيكلية المبسطة للموقع

## فلسفة النظام البسيطة:

### 1. معرف واحد فقط - UUID
```
المستخدم له UUID واحد فقط من Supabase Auth
- UUID = المعرف الأساسي لكل شيء
- display_name = الاسم للعرض (يمكن تكراره)
- username = اسم المستخدم (فريد، case-insensitive)
- telegram_code = رمز صغير للتليغرام مثل "RY001"
```

### 2. نظام الأدوار المبسط (6 أدوار فقط):
```sql
-- جدول الأدوار
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL, -- super_admin, department_manager, sales_employee, warehouse_employee, delivery_coordinator, cashier
  display_name TEXT NOT NULL,
  hierarchy_level INTEGER NOT NULL
);

-- ربط المستخدمين بالأدوار
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_name TEXT REFERENCES roles(name) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);
```

### 3. نظام البيانات الموحد:
```javascript
// Provider واحد لكل البيانات
<UnifiedDataProvider>
  <App />
</UnifiedDataProvider>

// Hook واحد للوصول لكل شيء
const { products, orders, customers, inventory, profits } = useUnifiedData();
```

### 4. الجداول الأساسية (12 جدول فقط):

#### أ) نظام المستخدمين (3 جداول):
1. **profiles** - بيانات المستخدمين الأساسية
2. **user_roles** - أدوار المستخدمين
3. **roles** - تعريف الأدوار

#### ب) نظام المنتجات (3 جداول):
4. **products** - المنتجات الأساسية
5. **product_variants** - متغيرات المنتجات (اللون، الحجم، الكمية)
6. **categories** - التصنيفات (بيانات JSONB مرنة)

#### ج) نظام الطلبات (2 جداول):
7. **orders** - الطلبات الأساسية
8. **order_items** - عناصر الطلبات

#### د) نظام المالية (2 جداول):
9. **profits** - الأرباح
10. **expenses** - المصاريف

#### ه) نظام المشتريات (1 جدول):
11. **purchases** - المشتريات

#### و) النظام المساعد (1 جدول):
12. **system_settings** - إعدادات النظام العامة

### 5. نظام الصلاحيات المبسط:

```javascript
// تحديد الصلاحيات بناء على الدور فقط
const ROLE_PERMISSIONS = {
  super_admin: ['*'], // كل شيء
  department_manager: ['view_all', 'manage_employees', 'manage_products', 'view_profits'],
  sales_employee: ['view_own_data', 'create_orders', 'manage_customers'],
  warehouse_employee: ['manage_inventory', 'view_products'],
  delivery_coordinator: ['manage_deliveries', 'view_orders'],
  cashier: ['manage_cash', 'view_financial_summary']
};
```

### 6. البيانات تُجلب مرة واحدة:
```javascript
// React Query مع Global State
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      cacheTime: 10 * 60 * 1000, // 10 دقائق
    },
  },
});

// البيانات تُحدث تلقائياً عبر الصفحات
```

### 7. رموز التليغرام البسيطة:
```
RY001, RY002, RY003... إلخ
- RY = اختصار اسم الشركة
- 001 = رقم تسلسلي بسيط
```

## الأدوار كما هي في صفحة إدارة الموظفين:

1. **super_admin** (المدير العام) - كل الصلاحيات
2. **department_manager** (مدير/نائب القسم) - إدارة الموظفين والمنتجات
3. **sales_employee** (موظف مبيعات) - إنشاء طلبات وإدارة العملاء  
4. **warehouse_employee** (موظف مخزن) - إدارة المخزون
5. **delivery_coordinator** (منسق توصيل) - إدارة التوصيل
6. **cashier** (كاشير) - إدارة النقد والتحصيل

## المبادئ الأساسية:
- **معرف واحد**: UUID من Supabase Auth
- **بيانات مركزية**: Provider واحد لكل البيانات
- **صلاحيات بسيطة**: بناء على الدور فقط
- **جداول قليلة**: 12 جدول بدلاً من 27
- **رموز بسيطة**: RY + رقم تسلسلي

هذا سيحل جميع مشاكل الموقع السابق ويجعل كل شيء مترابطاً وبسيطاً.
