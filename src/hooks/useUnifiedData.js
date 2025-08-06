import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useMemo } from 'react';

/**
 * Hook موحد للوصول لجميع البيانات والحسابات والصلاحيات
 */
const useUnifiedData = () => {
  const globalData = useGlobalData();
  const authContext = useAuth();
  const permissionsContext = usePermissions();

  const { 
    products = [], 
    orders = [], 
    customers = [], 
    loading = false, 
    error = null,
    calculations = {},
    refreshData = () => {}
  } = globalData || {};

  const { user, profile } = authContext || {};
  const { hasPermission, isAdmin, canViewAllData } = permissionsContext || {};

  // حسابات موحدة ومحدثة
  const unifiedCalculations = useMemo(() => {
    const filteredOrders = canViewAllData ? orders : orders.filter(o => o.created_by === user?.id);
    const filteredProducts = canViewAllData ? products : products;

    return {
      // إحصائيات الطلبات
      totalOrders: filteredOrders.length,
      completedOrders: filteredOrders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
      pendingOrders: filteredOrders.filter(o => o.status === 'pending').length,
      
      // إحصائيات مالية
      totalRevenue: filteredOrders
        .filter(o => o.status === 'completed' || o.status === 'delivered')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),
      
      // إحصائيات المنتجات
      totalProducts: filteredProducts.length,
      activeProducts: filteredProducts.filter(p => p.is_active !== false).length,
      lowStockProducts: filteredProducts.filter(p => (p.quantity || 0) < (p.min_stock || 5)).length,
      
      // إحصائيات العملاء
      totalCustomers: customers.length,
      
      // الحسابات الأصلية من GlobalDataProvider
      ...calculations
    };
  }, [orders, products, customers, calculations, canViewAllData, user?.id]);

  // عمليات موحدة
  const unifiedOperations = {
    refreshData,
    // يمكن إضافة المزيد من العمليات هنا
  };

  // صلاحيات موحدة
  const unifiedPermissions = {
    hasPermission,
    isAdmin,
    canViewAllData,
    canManageProducts: hasPermission('manage_products'),
    canManageOrders: hasPermission('manage_orders'),
    canViewReports: hasPermission('view_reports'),
    canManageUsers: hasPermission('manage_employees'),
  };

  return {
    // البيانات
    products,
    orders,
    customers,
    user,
    profile,
    
    // حالات التحميل والأخطاء
    isLoading: loading,
    error,
    
    // الحسابات الموحدة
    calculations: unifiedCalculations,
    
    // العمليات
    operations: unifiedOperations,
    
    // الصلاحيات
    permissions: unifiedPermissions,
    
    // للتوافق مع الكود الحالي
    hasPermission,
    isAdmin,
    canViewAllData
  };
};

export default useUnifiedData;