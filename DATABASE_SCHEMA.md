# هيكل قاعدة البيانات المطلوبة

## الجداول الأساسية:

### 1. users (Supabase Auth)
- id: UUID (Primary Key) - معرف Supabase الأساسي
- email: string
- created_at: timestamp

### 2. profiles
- id: serial (Primary Key) - المعرف الرقمي الصغير
- user_id: UUID (Foreign Key to users.id)
- username: string (unique)
- full_name: string
- company_name: string
- phone: string
- status: enum (active, pending, suspended)
- created_at: timestamp

### 3. roles
- id: serial
- name: string (unique)
- display_name: string
- hierarchy_level: integer
- is_active: boolean

### 4. permissions
- id: serial
- name: string (unique)
- display_name: string
- category: string

### 5. user_roles
- id: serial
- user_id: UUID (FK to profiles.user_id)
- role_id: integer (FK to roles.id)
- is_active: boolean

### 6. role_permissions
- id: serial
- role_id: integer (FK to roles.id)
- permission_id: integer (FK to permissions.id)

### 7. user_product_permissions
- id: serial
- user_id: UUID (FK to profiles.user_id)
- permission_type: string
- allowed_items: jsonb
- has_full_access: boolean

### 8. products
- id: serial
- name: string
- barcode: string
- created_by: UUID (FK to profiles.user_id)
- is_active: boolean

### 9. product_variants
- id: serial
- product_id: integer (FK to products.id)
- color_id: integer
- size_id: integer
- quantity: integer
- cost_price: decimal
- sale_price: decimal

### 10. orders
- id: serial
- customer_name: string
- employee_id: UUID (FK to profiles.user_id)
- total_amount: decimal
- status: enum

### 11. order_items
- id: serial
- order_id: integer (FK to orders.id)
- product_variant_id: integer (FK to product_variants.id)
- quantity: integer
- unit_price: decimal

### 12. customers
- id: serial
- name: string
- phone: string
- address: string
- province: string

### 13. purchases
- id: serial
- supplier_name: string
- created_by: UUID (FK to profiles.user_id)
- total_amount: decimal

### 14. expenses
- id: serial
- description: string
- amount: decimal
- created_by: UUID (FK to profiles.user_id)

### 15. profits
- id: serial
- order_id: integer (FK to orders.id)
- employee_id: UUID (FK to profiles.user_id)
- profit_amount: decimal
- status: enum

### 16. cash_sources
- id: serial
- name: string
- current_balance: decimal

### 17. variants (categories, colors, sizes, departments)
- categories: id, name, display_name
- colors: id, name, hex_code
- sizes: id, name, display_order
- departments: id, name, description