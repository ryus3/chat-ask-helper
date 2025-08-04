import React, { createContext, useContext } from 'react';
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/UnifiedAuthContext';

// إنشاء Query Client مع إعدادات محسنة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 دقائق
      cacheTime: 10 * 60 * 1000, // 10 دقائق
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

// Context للوصول للبيانات الموحدة
const GlobalDataContext = createContext();

// دالة موحدة لجلب البيانات من Supabase
const fetchSupabaseData = async (table, options = {}) => {
  let query = supabase.from(table).select(options.select || '*');
  
  if (options.orderBy) {
    query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
  }
  
  if (options.filters) {
    options.filters.forEach(filter => {
      query = query.filter(filter.column, filter.operator, filter.value);
    });
  }
  
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Hook موحد لجميع البيانات
export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    throw new Error('useGlobalData must be used within GlobalDataProvider');
  }
  return context;
};

// Hooks محددة لكل نوع بيانات
export const useProductsData = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchSupabaseData('products', {
      select: '*',
      orderBy: { column: 'created_at', ascending: false }
    }),
  });
};

export const useOrdersData = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => fetchSupabaseData('orders', {
      select: '*',
      orderBy: { column: 'created_at', ascending: false }
    }),
  });
};

export const useInventoryData = () => {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => fetchSupabaseData('inventory'),
  });
};

export const usePurchasesData = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: () => fetchSupabaseData('purchases', {
      orderBy: { column: 'created_at', ascending: false }
    }),
  });
};

export const useVariantsData = () => {
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchSupabaseData('categories'),
  });
  
  const colors = useQuery({
    queryKey: ['colors'],
    queryFn: () => fetchSupabaseData('colors'),
  });
  
  const sizes = useQuery({
    queryKey: ['sizes'],
    queryFn: () => fetchSupabaseData('sizes'),
  });
  
  const departments = useQuery({
    queryKey: ['departments'],
    queryFn: () => fetchSupabaseData('departments'),
  });

  return {
    categories: categories.data || [],
    colors: colors.data || [],
    sizes: sizes.data || [],
    departments: departments.data || [],
    isLoading: categories.isLoading || colors.isLoading || sizes.isLoading || departments.isLoading,
    error: categories.error || colors.error || sizes.error || departments.error
  };
};

export const useProfitsData = () => {
  return useQuery({
    queryKey: ['profits'],
    queryFn: () => fetchSupabaseData('profits'),
  });
};

export const useExpensesData = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => fetchSupabaseData('expenses', {
      orderBy: { column: 'transaction_date', ascending: false }
    }),
  });
};

export const useCustomersData = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchSupabaseData('customers'),
  });
};

export const useCashSourcesData = () => {
  return useQuery({
    queryKey: ['cash_sources'],
    queryFn: () => fetchSupabaseData('cash_sources'),
  });
};

// Provider Component
const GlobalDataProviderCore = ({ children }) => {
  const queryClient = useQueryClient();
  
  // جلب جميع البيانات مرة واحدة
  const products = useProductsData();
  const orders = useOrdersData();
  const inventory = useInventoryData();
  const purchases = usePurchasesData();
  const variants = useVariantsData();
  const profits = useProfitsData();
  const expenses = useExpensesData();
  const customers = useCustomersData();
  const cashSources = useCashSourcesData();

  // دالات للتحديث والإضافة
  const invalidateQueries = (queryKeys) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: [key] });
    });
  };

  const updateCache = (queryKey, updateFn) => {
    queryClient.setQueryData([queryKey], updateFn);
  };

  // الحسابات الموحدة
  const calculations = {
    // حساب إجمالي الإيرادات
    getTotalRevenue: () => {
      if (!orders.data) return 0;
      return orders.data
        .filter(o => o.status === 'delivered' || o.status === 'completed')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0);
    },
    
    // حساب إجمالي الأرباح
    getTotalProfits: () => {
      if (!profits.data) return 0;
      return profits.data
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.total_profit || 0), 0);
    },
    
    // حساب قيمة المخزون
    getInventoryValue: () => {
      if (!products.data) return 0;
      return products.data.reduce((sum, product) => {
        return sum + (product.variants || []).reduce((variantSum, variant) => {
          return variantSum + ((variant.quantity || 0) * (variant.cost_price || 0));
        }, 0);
      }, 0);
    },
    
    // عدد المنتجات النشطة
    getActiveProductsCount: () => {
      if (!products.data) return 0;
      return products.data.filter(p => p.is_active).length;
    },
    
    // عدد الطلبات المعلقة
    getPendingOrdersCount: () => {
      if (!orders.data) return 0;
      return orders.data.filter(o => o.status === 'pending').length;
    }
  };

  const contextValue = {
    // البيانات
    products: products.data || [],
    orders: orders.data || [],
    inventory: inventory.data || [],
    purchases: purchases.data || [],
    variants,
    profits: profits.data || [],
    expenses: expenses.data || [],
    customers: customers.data || [],
    cashSources: cashSources.data || [],
    
    // حالة التحميل
    isLoading: products.isLoading || orders.isLoading || inventory.isLoading || 
              purchases.isLoading || variants.isLoading || profits.isLoading || 
              expenses.isLoading || customers.isLoading || cashSources.isLoading,
    
    // الأخطاء
    error: products.error || orders.error || inventory.error || 
           purchases.error || variants.error || profits.error || 
           expenses.error || customers.error || cashSources.error,
    
    // دالات التحديث
    invalidateQueries,
    updateCache,
    
    // الحسابات الموحدة
    calculations,
    
    // Query Client للعمليات المتقدمة
    queryClient
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
};

// المكون الرئيسي
export const GlobalDataProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalDataProviderCore>
        {children}
      </GlobalDataProviderCore>
    </QueryClientProvider>
  );
};