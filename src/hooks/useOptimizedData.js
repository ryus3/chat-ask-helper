import React, { useMemo } from 'react';
import { useUnifiedInventory } from '@/contexts/UnifiedInventoryProvider';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Hook محسن لتقليل استهلاك البيانات والحسابات
 * يحسب البيانات مرة واحدة ويعيد استخدامها
 */
export const useOptimizedData = (dataTypes = []) => {
  const {
    products: allProducts,
    orders: allOrders,
    profits: allProfits,
    customers,
    loading: isLoading,
    error,
    refreshData: invalidateQueries,
    updateProduct: updateCache
  } = useUnifiedInventory();

  const { user } = useAuth();
  const { canViewAllData, filterDataByUser, filterProductsByPermissions } = usePermissions();

  // فلترة البيانات مرة واحدة فقط
  const filteredData = useMemo(() => {
    const result = {};
    
    // فلترة المنتجات إذا كانت مطلوبة
    if (!dataTypes.length || dataTypes.includes('products')) {
      result.products = filterProductsByPermissions(allProducts || []);
    }
    
    // فلترة الطلبات إذا كانت مطلوبة
    if (!dataTypes.length || dataTypes.includes('orders')) {
      result.orders = canViewAllData 
        ? (allOrders || [])
        : filterDataByUser(allOrders || [], 'created_by');
    }
    
    // فلترة الأرباح إذا كانت مطلوبة
    if (!dataTypes.length || dataTypes.includes('profits')) {
      result.profits = canViewAllData
        ? (allProfits || [])
        : (allProfits || []).filter(p => p.employee_id === user?.id);
    }
    
    return result;
  }, [
    allProducts,
    allOrders,
    allProfits,
    customers,
    filterProductsByPermissions,
    canViewAllData,
    filterDataByUser,
    user?.id,
    dataTypes
  ]);

  // حسابات محسنة
  const optimizedCalculations = useMemo(() => {
    const { products = [], orders = [], profits = [] } = filteredData;

    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed');
    const completedProfits = profits.filter(p => p.status === 'completed');
    
    // حساب اليوم
    const today = new Date().toDateString();
    const todayOrders = completedOrders.filter(o => 
      new Date(o.created_at).toDateString() === today
    );
    
    // حساب الشهر الحالي
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyProfits = completedProfits.filter(p => {
      const profitDate = new Date(p.created_at);
      return profitDate.getMonth() === thisMonth && profitDate.getFullYear() === thisYear;
    });

    return {
      // إحصائيات أساسية
      totalProducts: products.length,
      activeProducts: products.filter(p => p.is_active).length,
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: completedOrders.length,
      
      // الحسابات المالية
      totalRevenue: completedOrders.reduce((sum, o) => sum + (o.final_amount || 0), 0),
      totalProfits: completedProfits.reduce((sum, p) => sum + (p.total_profit || 0), 0),
      todaySales: todayOrders.reduce((sum, o) => sum + (o.final_amount || 0), 0),
      monthlyProfits: monthlyProfits.reduce((sum, p) => sum + (p.total_profit || 0), 0),
      
      // المخزون
      inventoryValue: products.reduce((sum, product) => {
        return sum + (product.variants || []).reduce((variantSum, variant) => {
          return variantSum + ((variant.quantity || 0) * (variant.cost_price || 0));
        }, 0);
      }, 0),
      
      lowStockProducts: products.filter(p => 
        (p.variants || []).some(v => (v.quantity || 0) <= (p.min_stock || 5))
      ).length
    };
  }, [filteredData]);

  // دالات العمليات المحسنة
  const operations = useMemo(() => ({
    refreshData: (types = []) => {
      const typesToRefresh = types.length > 0 ? types : [
        'products', 'orders', 'inventory', 'purchases', 'profits', 'expenses'
      ];
      invalidateQueries(typesToRefresh);
    },
    
    updateData: (queryKey, updateFn) => {
      updateCache(queryKey, updateFn);
    },
    
    // دالة لإضافة عنصر جديد للكاش
    addToCache: (queryKey, newItem) => {
      updateCache(queryKey, (oldData) => {
        if (!oldData) return [newItem];
        return [newItem, ...oldData];
      });
    },
    
    // دالة لتحديث عنصر في الكاش
    updateInCache: (queryKey, itemId, updates) => {
      updateCache(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        );
      });
    },
    
    // دالة لحذف عنصر من الكاش
    removeFromCache: (queryKey, itemId) => {
      updateCache(queryKey, (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter(item => item.id !== itemId);
      });
    }
  }), [invalidateQueries, updateCache]);

  return {
    // البيانات المفلترة
    ...filteredData,
    
    // الحسابات المحسنة
    calculations: optimizedCalculations,
    
    // حالة التحميل والأخطاء
    isLoading,
    error,
    
    // العمليات المحسنة
    operations,
    
    // معلومات إضافية
    permissions: { canViewAllData, userId: user?.id }
  };
};

export default useOptimizedData;