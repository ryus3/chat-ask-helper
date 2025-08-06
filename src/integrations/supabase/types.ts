export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cash_movements: {
        Row: {
          amount: number
          balance_after: number
          balance_before: number
          cash_source_id: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          movement_type: string
          reference_id: string | null
          reference_type: string
        }
        Insert: {
          amount: number
          balance_after?: number
          balance_before?: number
          cash_source_id: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          movement_type: string
          reference_id?: string | null
          reference_type: string
        }
        Update: {
          amount?: number
          balance_after?: number
          balance_before?: number
          cash_source_id?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          movement_type?: string
          reference_id?: string | null
          reference_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_cash_source_id_fkey"
            columns: ["cash_source_id"]
            isOneToOne: false
            referencedRelation: "cash_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sources: {
        Row: {
          created_at: string
          current_balance: number
          description: string | null
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_balance?: number
          description?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_balance?: number
          description?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          department_id: number | null
          description: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          department_id?: number | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          department_id?: number | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      colors: {
        Row: {
          created_at: string | null
          display_order: number | null
          hex_code: string | null
          id: number
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          hex_code?: string | null
          id?: number
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          hex_code?: string | null
          id?: number
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          id: number
          is_active: boolean | null
          last_order_date: string | null
          loyalty_points: number | null
          loyalty_tier: string | null
          name: string
          phone: string
          province: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          last_order_date?: string | null
          loyalty_points?: number | null
          loyalty_tier?: string | null
          name: string
          phone: string
          province?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          is_active?: boolean | null
          last_order_date?: string | null
          loyalty_points?: number | null
          loyalty_tier?: string | null
          name?: string
          phone?: string
          province?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string
          expense_date: string | null
          id: number
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          expense_date?: string | null
          id?: number
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          expense_date?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          movement_type: string
          notes: string | null
          product_variant_id: number | null
          quantity: number
          reference_id: number | null
          reference_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          movement_type: string
          notes?: string | null
          product_variant_id?: number | null
          quantity: number
          reference_id?: number | null
          reference_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          movement_type?: string
          notes?: string | null
          product_variant_id?: number | null
          quantity?: number
          reference_id?: number | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_movements_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          auto_delete: boolean | null
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auto_delete?: boolean | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auto_delete?: boolean | null
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color_name: string | null
          cost_price: number
          created_at: string | null
          id: number
          order_id: number | null
          product_name: string
          product_variant_id: number | null
          quantity: number
          size_name: string | null
          sku: string
          total_price: number
          unit_price: number
        }
        Insert: {
          color_name?: string | null
          cost_price: number
          created_at?: string | null
          id?: number
          order_id?: number | null
          product_name: string
          product_variant_id?: number | null
          quantity: number
          size_name?: string | null
          sku: string
          total_price: number
          unit_price: number
        }
        Update: {
          color_name?: string | null
          cost_price?: number
          created_at?: string | null
          id?: number
          order_id?: number | null
          product_name?: string
          product_variant_id?: number | null
          quantity?: number
          size_name?: string | null
          sku?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          customer_address: string | null
          customer_city: string | null
          customer_id: number | null
          customer_name: string
          customer_phone: string
          customer_province: string | null
          delivery_data: Json | null
          delivery_fee: number | null
          delivery_partner: string | null
          delivery_type: string | null
          discount: number | null
          id: number
          is_archived: boolean | null
          notes: string | null
          order_number: string
          payment_status: string | null
          qr_id: string
          receipt_received: boolean | null
          status: string | null
          subtotal: number
          total_amount: number
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: number | null
          customer_name: string
          customer_phone: string
          customer_province?: string | null
          delivery_data?: Json | null
          delivery_fee?: number | null
          delivery_partner?: string | null
          delivery_type?: string | null
          discount?: number | null
          id?: number
          is_archived?: boolean | null
          notes?: string | null
          order_number: string
          payment_status?: string | null
          qr_id: string
          receipt_received?: boolean | null
          status?: string | null
          subtotal: number
          total_amount: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          customer_address?: string | null
          customer_city?: string | null
          customer_id?: number | null
          customer_name?: string
          customer_phone?: string
          customer_province?: string | null
          delivery_data?: Json | null
          delivery_fee?: number | null
          delivery_partner?: string | null
          delivery_type?: string | null
          discount?: number | null
          id?: number
          is_archived?: boolean | null
          notes?: string | null
          order_number?: string
          payment_status?: string | null
          qr_id?: string
          receipt_received?: boolean | null
          status?: string | null
          subtotal?: number
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_permissions: {
        Row: {
          can_sell: boolean | null
          can_view: boolean | null
          created_at: string | null
          id: string
          product_id: string
          user_id: string | null
        }
        Insert: {
          can_sell?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          product_id: string
          user_id?: string | null
        }
        Update: {
          can_sell?: boolean | null
          can_view?: boolean | null
          created_at?: string | null
          id?: string
          product_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          barcode: string | null
          color_id: number | null
          cost_price: number
          created_at: string | null
          id: number
          images: string[] | null
          is_active: boolean | null
          price: number
          product_id: number | null
          reserved_quantity: number | null
          size_id: number | null
          sku: string
          stock_quantity: number | null
          updated_at: string | null
          variant_qr_code: string | null
        }
        Insert: {
          barcode?: string | null
          color_id?: number | null
          cost_price: number
          created_at?: string | null
          id?: number
          images?: string[] | null
          is_active?: boolean | null
          price: number
          product_id?: number | null
          reserved_quantity?: number | null
          size_id?: number | null
          sku: string
          stock_quantity?: number | null
          updated_at?: string | null
          variant_qr_code?: string | null
        }
        Update: {
          barcode?: string | null
          color_id?: number | null
          cost_price?: number
          created_at?: string | null
          id?: number
          images?: string[] | null
          is_active?: boolean | null
          price?: number
          product_id?: number | null
          reserved_quantity?: number | null
          size_id?: number | null
          sku?: string
          stock_quantity?: number | null
          updated_at?: string | null
          variant_qr_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_color_id_fkey"
            columns: ["color_id"]
            isOneToOne: false
            referencedRelation: "colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_size_id_fkey"
            columns: ["size_id"]
            isOneToOne: false
            referencedRelation: "sizes"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          base_price: number | null
          category_id: number | null
          cost_price: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          images: string[] | null
          is_active: boolean | null
          name: string
          qr_code: string | null
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          base_price?: number | null
          category_id?: number | null
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          images?: string[] | null
          is_active?: boolean | null
          name: string
          qr_code?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          base_price?: number | null
          category_id?: number | null
          cost_price?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          qr_code?: string | null
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          employee_code: string | null
          employee_id: number | null
          full_name: string
          id: string
          is_active: boolean | null
          role: string
          telegram_code: string | null
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          employee_code?: string | null
          employee_id?: number | null
          full_name: string
          id: string
          is_active?: boolean | null
          role?: string
          telegram_code?: string | null
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          employee_code?: string | null
          employee_id?: number | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          role?: string
          telegram_code?: string | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      profits: {
        Row: {
          created_at: string | null
          employee_id: string | null
          employee_profit: number
          id: number
          manager_profit: number
          order_id: number | null
          product_variant_id: number | null
          profit_amount: number
          settled_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id?: string | null
          employee_profit: number
          id?: number
          manager_profit: number
          order_id?: number | null
          product_variant_id?: number | null
          profit_amount: number
          settled_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string | null
          employee_profit?: number
          id?: number
          manager_profit?: number
          order_id?: number | null
          product_variant_id?: number | null
          profit_amount?: number
          settled_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profits_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profits_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_items: {
        Row: {
          created_at: string | null
          id: number
          product_variant_id: number | null
          purchase_id: number | null
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_variant_id?: number | null
          purchase_id?: number | null
          quantity: number
          total_cost: number
          unit_cost: number
        }
        Update: {
          created_at?: string | null
          id?: number
          product_variant_id?: number | null
          purchase_id?: number | null
          quantity?: number
          total_cost?: number
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_variant_id_fkey"
            columns: ["product_variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          notes: string | null
          purchase_number: string
          status: string | null
          supplier_name: string
          supplier_phone: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          notes?: string | null
          purchase_number: string
          status?: string | null
          supplier_name: string
          supplier_phone?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          notes?: string | null
          purchase_number?: string
          status?: string | null
          supplier_name?: string
          supplier_phone?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      sizes: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          name: string
          size_category: string | null
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name: string
          size_category?: string | null
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          name?: string
          size_category?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_granted: boolean | null
          permission_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_granted?: boolean | null
          permission_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_granted?: boolean | null
          permission_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_cash_to_source: {
        Args: {
          source_id: string
          amount: number
          description: string
          reference_type?: string
          reference_id?: string
        }
        Returns: undefined
      }
      check_user_role: {
        Args: { user_uuid: string; required_role: string }
        Returns: boolean
      }
      finalize_stock_sale: {
        Args: { p_product_variant_id: number; p_quantity: number }
        Returns: undefined
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_order_qr: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_enhanced_main_cash_balance: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_by_username: {
        Args: { username_input: string }
        Returns: {
          user_id: string
          email: string
          full_name: string
          role: string
        }[]
      }
      update_reserved_stock: {
        Args: { p_product_variant_id: number; p_quantity_change: number }
        Returns: undefined
      }
      user_has_permission: {
        Args: { user_uuid: string; permission_name: string }
        Returns: boolean
      }
      username_exists: {
        Args: { username_input: string }
        Returns: boolean
      }
      withdraw_cash_from_source: {
        Args: {
          source_id: string
          amount: number
          description: string
          reference_type?: string
          reference_id?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
