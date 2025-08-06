# هيكلية النظام المطلوبة

## المشاكل الحالية:

### 1. نظام IDs معقد
- يوجد عدة معرفات: UUID, employee_id, small_id
- عدم توحيد استخدام المعرفات
- صعوبة في ربط البيانات

### 2. تكرار استدعاء البيانات
- كل صفحة تستدعي البيانات منفصلة
- عدم وجود cache موحد
- contexts متعددة ومبعثرة

### 3. عدم ترابط الصفحات
- كل صفحة معزولة
- عدم مشاركة الحالة
- تحديث غير متسق

## الحلول المطلوبة:

### 1. توحيد نظام IDs
```javascript
// استخدام UUID كمعرف أساسي واحد فقط
const userId = user.id; // من Supabase Auth
const profileId = profile.id; // ID رقمي للعرض فقط
```

### 2. نظام بيانات موحد
```javascript
// Provider واحد لجميع البيانات
<UnifiedDataProvider>
  <App />
</UnifiedDataProvider>
```

### 3. Hooks موحدة
```javascript
// Hook واحد لكل نوع بيانات
const { products, loading, error, operations } = useProducts();
const { orders, stats } = useOrders();
```

### 4. State Management موحد
```javascript
// استخدام React Query + Context
const queryClient = new QueryClient();
const globalState = useGlobalState();
```

## التطبيقات المطلوبة:

### الصفحات الأساسية:
1. **Dashboard** - لوحة التحكم الرئيسية
2. **Products** - عرض المنتجات للعملاء
3. **Manage Products** - إدارة المنتجات
4. **Add Product** - إضافة منتج جديد
5. **Inventory** - إدارة المخزون
6. **Orders** - إدارة الطلبات
7. **Customers** - إدارة العملاء
8. **Purchases** - إدارة المشتريات
9. **Profits** - إدارة الأرباح
10. **Settings** - الإعدادات
11. **Employees** - إدارة الموظفين
12. **Accounting** - المحاسبة

### أنظمة فرعية:
1. **Authentication** - المصادقة والصلاحيات
2. **Notifications** - الإشعارات
3. **Reports** - التقارير
4. **Telegram Bot** - بوت التليغرام
5. **Backup System** - النسخ الاحتياطي

## خطة التطوير:

### المرحلة 1: توحيد البيانات
1. إنشاء UnifiedDataProvider
2. دمج جميع contexts في مكان واحد
3. استخدام React Query للتخزين المؤقت

### المرحلة 2: توحيد المعرفات
1. استخدام UUID واحد فقط
2. إزالة المعرفات المتعددة
3. تحديث جميع الجداول

### المرحلة 3: تحسين الأداء
1. تقليل استدعاءات API
2. تحسين التخزين المؤقت
3. تحسين تجربة المستخدم

### المرحلة 4: ربط الصفحات
1. مشاركة الحالة بين الصفحات
2. التحديث المتسق
3. Navigation موحد