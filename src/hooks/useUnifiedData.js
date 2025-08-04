import { useMemo } from 'react';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook موحد يحل محل جميع useInventory, useVariants, useProfits
 * يوفر بيانات مفلترة حسب الصلاحيات وحسابات موحدة
 */
export const useUnifiedData = () => {
  const {
    products: allProducts,
    orders: allOrders,
    inventory,
    purchases,
    variants,
    profits: allProfits,
    expenses,
    customers,
    cashSources,
    isLoading,
    error,
    calculations,
    invalidateQueries,
    updateCache,
    queryClient
  } = useGlobalData();

  const { user } = useAuth();
  const { hasPermission, canViewAllData, filterDataByUser, filterProductsByPermissions } = usePermissions();

  // فلترة البيانات حسب الصلاحيات
  const filteredData = useMemo(() => {
    // فلترة المنتجات حسب الصلاحيات
    const products = filterProductsByPermissions(allProducts);
    
    // فلترة الطلبات حسب الصلاحيات
    const orders = canViewAllData 
      ? allOrders 
      : filterDataByUser(allOrders, 'created_by');
    
    // فلترة الأرباح حسب الصلاحيات
    const profits = canViewAllData
      ? allProfits
      : allProfits.filter(p => p.employee_id === user?.id);

    return {
      products,
      orders,
      profits,
      inventory,
      purchases,
      variants,
      expenses,
      customers,
      cashSources
    };
  }, [allProducts, allOrders, allProfits, inventory, purchases, variants, expenses, customers, cashSources, filterProductsByPermissions, canViewAllData, filterDataByUser, user?.id]);

  // الحسابات الموحدة مع الصلاحيات
  const unifiedCalculations = useMemo(() => {
    const { products, orders, profits } = filteredData;

    return {
      // إجمالي المنتجات
      totalProducts: products.length,
      
      // المنتجات النشطة
      activeProducts: products.filter(p => p.is_active).length,
      
      // إجمالي الطلبات
      totalOrders: orders.length,
      
      // الطلبات المعلقة
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      
      // الطلبات المكتملة
      completedOrders: orders.filter(o => o.status === 'delivered' || o.status === 'completed').length,
      
      // إجمالي الإيرادات
      totalRevenue: orders
        .filter(o => o.status === 'delivered' || o.status === 'completed')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),
      
      // إجمالي الأرباح
      totalProfits: profits
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.total_profit || 0), 0),
      
      // قيمة المخزون
      inventoryValue: products.reduce((sum, product) => {
        return sum + (product.variants || []).reduce((variantSum, variant) => {
          return variantSum + ((variant.quantity || 0) * (variant.cost_price || 0));
        }, 0);
      }, 0),
      
      // المنتجات منخفضة المخزون
      lowStockProducts: products.filter(p => 
        (p.variants || []).some(v => (v.quantity || 0) <= (p.min_stock || 5))
      ).length,
      
      // إحصائيات المبيعات اليومية
      todaySales: orders
        .filter(o => {
          const today = new Date().toDateString();
          const orderDate = new Date(o.created_at).toDateString();
          return orderDate === today && (o.status === 'delivered' || o.status === 'completed');
        })
        .reduce((sum, o) => sum + (o.final_amount || 0), 0),
      
      // إحصائيات الأرباح الشهرية
      monthlyProfits: profits
        .filter(p => {
          const thisMonth = new Date().getMonth();
          const thisYear = new Date().getFullYear();
          const profitDate = new Date(p.created_at);
          return profitDate.getMonth() === thisMonth && 
                 profitDate.getFullYear() === thisYear &&
                 p.status === 'completed';
        })
        .reduce((sum, p) => sum + (p.total_profit || 0), 0)
    };
  }, [filteredData]);

  // دالات العمليات الموحدة
  const operations = {
    // تحديث المخزون
    updateStock: async (productId, variantId, newQuantity) => {
      // منطق تحديث المخزون
      // سيتم تنفيذه لاحقاً
    },
    
    // إضافة طلب جديد
    createOrder: async (orderData) => {
      // منطق إنشاء الطلب
      // سيتم تنفيذه لاحقاً
    },
    
    // تحديث البيانات
    refreshData: (dataTypes = []) => {
      const typesToRefresh = dataTypes.length > 0 ? dataTypes : [
        'products', 'orders', 'inventory', 'purchases', 'profits', 'expenses'
      ];
      invalidateQueries(typesToRefresh);
    }
  };

  return {
    // البيانات المفلترة
    ...filteredData,
    
    // الحسابات الموحدة
    calculations: unifiedCalculations,
    
    // حالة التحميل والأخطاء
    isLoading,
    error,
    
    // العمليات
    operations,
    
    // معلومات الصلاحيات
    permissions: {
      canViewAllData,
      hasPermission,
      userId: user?.id
    },
    
    // دالات إدارة Cache
    invalidateQueries,
    updateCache,
    queryClient
  };
};

export default useUnifiedData;