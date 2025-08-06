import React, { useMemo } from 'react';
import { useUnifiedInventory } from '@/contexts/UnifiedInventoryProvider';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook موحد وبسيط للوصول لجميع البيانات والحسابات والصلاحيات
 * يضمن أن جميع الصفحات تستخدم نفس البيانات
 */
const useUnifiedData = () => {
  // الحصول على البيانات من المصادر الموحدة بحماية من الأخطاء
  const inventoryData = useUnifiedInventory() || {};
  const authContext = useAuth() || {};
  const permissionsContext = usePermissions() || {};

  // استخراج البيانات الأساسية
  const { 
    products = [], 
    orders = [], 
    customers = [],
    categories = [],
    colors = [],
    sizes = [],
    departments = [],
    loading = false, 
    error = null,
    calculations = {},
    refreshData = () => {},
    updateProduct = () => {},
    addProduct = () => {},
    updateOrder = () => {}
  } = inventoryData;

  const { user, profile } = authContext;
  const { hasPermission, isAdmin, canViewAllData } = permissionsContext;

  // فلترة البيانات حسب الصلاحيات
  const filteredData = useMemo(() => {
    if (canViewAllData || isAdmin) {
      return {
        products,
        orders,
        customers
      };
    } else {
      // عرض البيانات الخاصة بالمستخدم فقط
      return {
        products: products.filter(p => p.created_by === user?.id),
        orders: orders.filter(o => o.created_by === user?.id || o.assigned_to === user?.id),
        customers: customers.filter(c => c.created_by === user?.id)
      };
    }
  }, [products, orders, customers, canViewAllData, isAdmin, user?.id]);

  // حسابات محسنة ومفلترة
  const enhancedCalculations = useMemo(() => {
    const { products: filteredProducts, orders: filteredOrders, customers: filteredCustomers } = filteredData;

    return {
      // إحصائيات الطلبات
      totalOrders: filteredOrders.length,
      completedOrders: filteredOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
      pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
      cancelledOrders: filteredOrders.filter(o => o.status === 'cancelled').length,
      
      // إحصائيات مالية
      totalRevenue: filteredOrders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),
      
      pendingRevenue: filteredOrders
        .filter(o => o.status === 'pending')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),
      
      averageOrderValue: filteredOrders.length > 0 
        ? filteredOrders.reduce((sum, o) => sum + (o.final_amount || 0), 0) / filteredOrders.length 
        : 0,
      
      // إحصائيات المنتجات
      totalProducts: filteredProducts.length,
      activeProducts: filteredProducts.filter(p => p.is_active !== false).length,
      lowStockProducts: filteredProducts.filter(p => (p.quantity || 0) < (p.min_stock || 5)).length,
      outOfStockProducts: filteredProducts.filter(p => (p.quantity || 0) === 0).length,
      
      // إحصائيات العملاء
      totalCustomers: filteredCustomers.length,
      
      // إحصائيات اليوم
      todayOrders: filteredOrders.filter(o => {
        const today = new Date().toDateString();
        const orderDate = new Date(o.created_at).toDateString();
        return today === orderDate;
      }).length,
      
      todayRevenue: filteredOrders
        .filter(o => {
          const today = new Date().toDateString();
          const orderDate = new Date(o.created_at).toDateString();
          return today === orderDate && (o.status === 'completed' || o.status === 'delivered');
        })
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),

      // إحصائيات الشهر
      monthlyRevenue: filteredOrders
        .filter(o => {
          const orderDate = new Date(o.created_at);
          const now = new Date();
          return orderDate.getMonth() === now.getMonth() && 
                 orderDate.getFullYear() === now.getFullYear() &&
                 (o.status === 'completed' || o.status === 'delivered');
        })
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),

      // الحسابات الأصلية
      ...calculations
    };
  }, [filteredData, calculations]);

  // عمليات محسنة
  const operations = {
    refreshData,
    updateProduct,
    addProduct,
    updateOrder,
    addOrder,
    updateCustomer,
    addCustomer,
    
    // عمليات إضافية
    getProductById: (id) => products.find(p => p.id === id),
    getOrderById: (id) => orders.find(o => o.id === id),
    getCustomerById: (id) => customers.find(c => c.id === id),
    
    // إحصائيات سريعة
    getTopProducts: (limit = 5) => {
      const productSales = {};
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            productSales[item.product_id] = (productSales[item.product_id] || 0) + item.quantity;
          });
        }
      });
      
      return Object.entries(productSales)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([productId, sales]) => ({
          product: products.find(p => p.id === productId),
          sales
        }))
        .filter(item => item.product);
    },
    
    getTopCustomers: (limit = 5) => {
      const customerOrders = {};
      orders.forEach(order => {
        if (order.customer_id) {
          customerOrders[order.customer_id] = (customerOrders[order.customer_id] || 0) + (order.final_amount || 0);
        }
      });
      
      return Object.entries(customerOrders)
        .sort(([,a], [,b]) => b - a)
        .slice(0, limit)
        .map(([customerId, total]) => ({
          customer: customers.find(c => c.id === customerId),
          total
        }))
        .filter(item => item.customer);
    }
  };

  // صلاحيات محسنة
  const permissions = {
    hasPermission,
    isAdmin,
    canViewAllData,
    canManageProducts: hasPermission('manage_products') || isAdmin,
    canManageOrders: hasPermission('manage_orders') || isAdmin,
    canViewReports: hasPermission('view_reports') || isAdmin,
    canManageUsers: hasPermission('manage_employees') || isAdmin,
    canManageInventory: hasPermission('manage_inventory') || isAdmin,
    canViewFinances: hasPermission('view_finances') || isAdmin
  };

  return {
    // البيانات المفلترة
    products: filteredData.products,
    orders: filteredData.orders,
    customers: filteredData.customers,
    
    // البيانات الثابتة (متاحة للجميع)
    inventory,
    categories,
    colors,
    sizes,
    departments,
    
    // معلومات المستخدم
    user,
    profile,
    
    // حالات النظام
    isLoading: loading,
    error,
    
    // الحسابات المحسنة
    calculations: enhancedCalculations,
    
    // العمليات
    operations,
    
    // الصلاحيات
    permissions,
    
    // للتوافق مع الكود القديم
    hasPermission,
    isAdmin,
    canViewAllData,
    
    // معلومات النظام
    systemInfo: {
      lastUpdate: new Date().toISOString(),
      dataStatus: {
        products: products.length,
        orders: orders.length,
        customers: customers.length
      },
      userPermissions: Object.keys(permissions).filter(key => permissions[key] === true)
    }
  };
};

export default useUnifiedData;