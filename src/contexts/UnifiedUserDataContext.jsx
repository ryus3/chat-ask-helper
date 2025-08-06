import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { useGlobalData } from '@/contexts/GlobalDataProvider';
import { getUserIds } from '@/utils/userIdSystem';

/**
 * Context موحد لبيانات المستخدم وإحصائياته وطلباته
 * يجمع جميع البيانات المرتبطة بالمستخدم في مكان واحد
 */
const UnifiedUserDataContext = createContext();

export const useUnifiedUserData = () => {
  const context = useContext(UnifiedUserDataContext);
  if (!context) {
    throw new Error('useUnifiedUserData must be used within UnifiedUserDataProvider');
  }
  return context;
};

export const UnifiedUserDataProvider = ({ children }) => {
  const { user } = useAuth();
  const { 
    orders: allOrders, 
    profits: allProfits, 
    customers: allCustomers,
    products: allProducts,
    isLoading 
  } = useGlobalData();

  // معرفات المستخدم الموحدة
  const userIds = useMemo(() => {
    return getUserIds(user);
  }, [user]);

  // فلترة البيانات الخاصة بالمستخدم الحالي
  const userData = useMemo(() => {
    if (!user?.id && !user?.user_id) {
      return {
        orders: [],
        profits: [],
        customers: [],
        stats: {
          totalOrders: 0,
          completedOrders: 0,
          pendingOrders: 0,
          totalRevenue: 0,
          totalProfits: 0,
          totalCustomers: 0
        }
      };
    }

    const userId = user.id || user.user_id;

    // طلبات المستخدم
    const userOrders = allOrders?.filter(order => 
      order.created_by === userId || 
      order.assigned_to === userId
    ) || [];

    // أرباح المستخدم
    const userProfits = allProfits?.filter(profit => 
      profit.employee_id === userId
    ) || [];

    // عملاء المستخدم (الذين أنشأهم)
    const userCustomers = allCustomers?.filter(customer => 
      customer.created_by === userId
    ) || [];

    // حساب الإحصائيات
    const completedOrders = userOrders.filter(o => 
      o.status === 'delivered' || o.status === 'completed'
    );
    
    const pendingOrders = userOrders.filter(o => 
      o.status === 'pending' || o.status === 'processing'
    );

    const totalRevenue = completedOrders.reduce((sum, order) => 
      sum + (order.final_amount || order.total_amount || 0), 0
    );

    const completedProfits = userProfits.filter(p => p.status === 'completed');
    const totalProfits = completedProfits.reduce((sum, profit) => 
      sum + (profit.employee_profit || profit.amount || 0), 0
    );

    const pendingProfits = userProfits.filter(p => p.status === 'pending');
    const pendingProfitAmount = pendingProfits.reduce((sum, profit) => 
      sum + (profit.employee_profit || profit.amount || 0), 0
    );

    return {
      orders: userOrders,
      profits: userProfits,
      customers: userCustomers,
      stats: {
        totalOrders: userOrders.length,
        completedOrders: completedOrders.length,
        pendingOrders: pendingOrders.length,
        totalRevenue,
        totalProfits,
        pendingProfitAmount,
        totalCustomers: userCustomers.length,
        // إحصائيات إضافية
        avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
        profitMargin: totalRevenue > 0 ? (totalProfits / totalRevenue) * 100 : 0
      }
    };
  }, [user, allOrders, allProfits, allCustomers]);

  // إحصائيات زمنية (اليوم، الأسبوع، الشهر)
  const timeBasedStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    const getOrdersByPeriod = (orders, fromDate) => {
      return orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= fromDate;
      });
    };

    const todayOrders = getOrdersByPeriod(userData.orders, today);
    const weekOrders = getOrdersByPeriod(userData.orders, weekAgo);
    const monthOrders = getOrdersByPeriod(userData.orders, monthAgo);

    const calculateRevenue = (orders) => {
      return orders
        .filter(o => o.status === 'delivered' || o.status === 'completed')
        .reduce((sum, o) => sum + (o.final_amount || 0), 0);
    };

    return {
      today: {
        orders: todayOrders.length,
        revenue: calculateRevenue(todayOrders)
      },
      week: {
        orders: weekOrders.length,
        revenue: calculateRevenue(weekOrders)
      },
      month: {
        orders: monthOrders.length,
        revenue: calculateRevenue(monthOrders)
      }
    };
  }, [userData.orders]);

  // أفضل العملاء للمستخدم
  const topCustomers = useMemo(() => {
    const customerOrderCounts = {};
    const customerRevenue = {};

    userData.orders.forEach(order => {
      if (order.customer_name) {
        const name = order.customer_name;
        customerOrderCounts[name] = (customerOrderCounts[name] || 0) + 1;
        
        if (order.status === 'delivered' || order.status === 'completed') {
          customerRevenue[name] = (customerRevenue[name] || 0) + (order.final_amount || 0);
        }
      }
    });

    return Object.keys(customerOrderCounts)
      .map(name => ({
        name,
        orders: customerOrderCounts[name],
        revenue: customerRevenue[name] || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [userData.orders]);

  const contextValue = {
    // بيانات المستخدم الأساسية
    user,
    userIds,
    
    // البيانات المفلترة
    userData,
    
    // الإحصائيات الزمنية
    timeBasedStats,
    
    // أفضل العملاء
    topCustomers,
    
    // حالة التحميل
    isLoading,
    
    // دالات مساعدة
    getUserOrdersByStatus: (status) => 
      userData.orders.filter(order => order.status === status),
    
    getUserProfitsByStatus: (status) => 
      userData.profits.filter(profit => profit.status === status),
    
    getOrdersInDateRange: (startDate, endDate) => 
      userData.orders.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= startDate && orderDate <= endDate;
      }),
    
    // معلومات التليغرام
    telegramInfo: {
      code: userIds.telegramCode,
      isActive: user?.telegram_active || false
    }
  };

  return (
    <UnifiedUserDataContext.Provider value={contextValue}>
      {children}
    </UnifiedUserDataContext.Provider>
  );
};