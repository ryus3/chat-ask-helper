import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './UnifiedAuthContext';

// Context للبيانات الموحدة
const GlobalDataContext = createContext(null);

// Hook للوصول للبيانات الموحدة
export const useGlobalData = () => {
  const context = useContext(GlobalDataContext);
  if (!context) {
    return {
      products: [],
      orders: [],
      customers: [],
      categories: [],
      colors: [],
      sizes: [],
      departments: [],
      loading: false,
      error: null,
      refreshData: () => {},
      calculations: {
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0
      }
    };
  }
  return context;
};

// Provider مبسط وفعال
export const GlobalDataProvider = ({ children }) => {
  // الحالات الأساسية
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const authContext = useAuth();
  const user = authContext?.user;

  // دالة جلب البيانات الموحدة
  const fetchAllData = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);

      // جلب جميع البيانات بطلبات متوازية
      const [
        productsRes,
        ordersRes,
        customersRes,
        categoriesRes,
        colorsRes,
        sizesRes,
        departmentsRes
      ] = await Promise.allSettled([
        supabase.from('products').select('*').eq('is_active', true).order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(200),
        supabase.from('customers').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('categories').select('*').order('name'),
        supabase.from('colors').select('*').order('name'),
        supabase.from('sizes').select('*').order('name'),
        supabase.from('departments').select('*').order('name')
      ]);

      // معالجة النتائج
      if (productsRes.status === 'fulfilled' && productsRes.value.data) {
        setProducts(productsRes.value.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value.data) {
        setOrders(ordersRes.value.data);
      }
      if (customersRes.status === 'fulfilled' && customersRes.value.data) {
        setCustomers(customersRes.value.data);
      }
      if (categoriesRes.status === 'fulfilled' && categoriesRes.value.data) {
        setCategories(categoriesRes.value.data);
      }
      if (colorsRes.status === 'fulfilled' && colorsRes.value.data) {
        setColors(colorsRes.value.data);
      }
      if (sizesRes.status === 'fulfilled' && sizesRes.value.data) {
        setSizes(sizesRes.value.data);
      }
      if (departmentsRes.status === 'fulfilled' && departmentsRes.value.data) {
        setDepartments(departmentsRes.value.data);
      }

    } catch (err) {
      console.error('خطأ في جلب البيانات:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  // حسابات موحدة
  const calculations = {
    totalRevenue: orders
      .filter(o => o.status === 'completed' || o.status === 'delivered')
      .reduce((sum, o) => sum + (o.final_amount || 0), 0),
    
    totalOrders: orders.length,
    completedOrders: orders.filter(o => o.status === 'completed' || o.status === 'delivered').length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    
    totalProducts: products.length,
    activeProducts: products.filter(p => p.is_active !== false).length,
    lowStockProducts: products.filter(p => (p.quantity || 0) < (p.min_stock || 5)).length,
    
    totalCustomers: customers.length,
    
    // معدلات الأداء
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, o) => sum + (o.final_amount || 0), 0) / orders.length 
      : 0,
    
    // إحصائيات شهرية
    monthlyRevenue: orders
      .filter(o => {
        const orderDate = new Date(o.created_at);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, o) => sum + (o.final_amount || 0), 0)
  };

  // دالات التحديث
  const updateProduct = useCallback((productId, updates) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
  }, []);

  const addProduct = useCallback((newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
  }, []);

  const updateOrder = useCallback((orderId, updates) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  }, []);

  const addOrder = useCallback((newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
  }, []);

  const updateCustomer = useCallback((customerId, updates) => {
    setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, ...updates } : c));
  }, []);

  const addCustomer = useCallback((newCustomer) => {
    setCustomers(prev => [newCustomer, ...prev]);
  }, []);

  // القيمة المُمررة للـ Context
  const contextValue = {
    // البيانات الأساسية
    products,
    orders,
    customers,
    categories,
    colors,
    sizes,
    departments,
    
    // حالة التحميل والأخطاء
    loading,
    error,
    
    // الحسابات الموحدة
    calculations,
    
    // دالات التحديث
    refreshData: fetchAllData,
    updateProduct,
    addProduct,
    updateOrder,
    addOrder,
    updateCustomer,
    addCustomer,
    
    // معلومات إضافية
    lastUpdate: new Date().toISOString(),
    dataStatus: {
      products: products.length,
      orders: orders.length,
      customers: customers.length
    }
  };

  return (
    <GlobalDataContext.Provider value={contextValue}>
      {children}
    </GlobalDataContext.Provider>
  );
};