/**
 * 🎯 نظام جلب البيانات الموحد والذكي
 * مصدر واحد للحقيقة - جلب مرة واحدة، استخدام في كل مكان
 * يحل مشكلة التناقض وتكرار الاستعلامات نهائياً
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// ذاكرة التخزين المؤقت العالمية
const globalCache = new Map();
const cacheExpiryTime = 5 * 60 * 1000; // 5 دقائق

export const useUnifiedInventoryData = () => {
  const [data, setData] = useState({
    products: [],
    departments: [],
    categories: [],
    colors: [],
    sizes: [],
    customers: [],
    orders: [],
    profits: [],
    loading: true,
    error: null,
    lastUpdated: null
  });

  // استعلام واحد شامل وذكي - جلب كل شيء مرة واحدة
  const fetchCompleteInventory = useCallback(async (forceRefresh = false) => {
    // التحقق من الكاش أولاً
    const cacheKey = 'complete_inventory';
    const cached = globalCache.get(cacheKey);
    
    if (!forceRefresh && cached && (Date.now() - cached.timestamp < cacheExpiryTime)) {
      setData({ ...cached.data, loading: false });
      return cached.data;
    }

    try {
      setData(prev => ({ ...prev, loading: true, error: null }));

      // جلب شامل ومحسن - استعلام واحد فقط
      const [
        departmentsResult,
        categoriesResult,
        colorsResult,
        sizesResult,
        productsResult,
        customersResult,
        ordersResult,
        profitsResult
      ] = await Promise.all([
        supabase.from('departments').select('*').order('display_order'),
        supabase.from('categories').select(`
          *, 
          departments(name)
        `).order('display_order'),
        supabase.from('colors').select('*').order('display_order'),
        supabase.from('sizes').select('*').order('display_order'),
        supabase.from('products').select(`
          *,
          categories(name, departments(name)),
          product_variants(
            *,
            colors(name, hex_code),
            sizes(name, display_order)
          )
        `).eq('is_active', true),
        supabase.from('customers').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select(`
          *,
          order_items(
            *,
            product_variants(
              *,
              products(name),
              colors(name),
              sizes(name)
            )
          ),
          customers(name, phone, loyalty_points)
        `).order('created_at', { ascending: false }),
        supabase.from('profits').select(`
          *,
          orders(order_number, qr_id),
          profiles(full_name)
        `)
      ]);

      // التحقق من الأخطاء
      const errors = [
        departmentsResult.error,
        categoriesResult.error,
        colorsResult.error,
        sizesResult.error,
        productsResult.error,
        customersResult.error,
        ordersResult.error,
        profitsResult.error
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(`فشل في جلب البيانات: ${errors[0].message}`);
      }

      // تجهيز البيانات المحسنة
      const freshData = {
        departments: departmentsResult.data || [],
        categories: categoriesResult.data || [],
        colors: colorsResult.data || [],
        sizes: sizesResult.data || [],
        products: productsResult.data || [],
        customers: customersResult.data || [],
        orders: ordersResult.data || [],
        profits: profitsResult.data || [],
        loading: false,
        error: null,
        lastUpdated: new Date()
      };

      // حفظ في الكاش
      globalCache.set(cacheKey, {
        data: freshData,
        timestamp: Date.now()
      });

      setData(freshData);
      return freshData;

    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
      const errorData = {
        ...data,
        loading: false,
        error: error.message
      };
      setData(errorData);
      toast({
        title: "خطأ في جلب البيانات",
        description: error.message,
        variant: "destructive"
      });
      return errorData;
    }
  }, []);

  // إعادة تحميل ذكية بالكاش
  const refreshData = useCallback(() => {
    return fetchCompleteInventory(true);
  }, [fetchCompleteInventory]);

  // تحديث منتج محدد بدون إعادة تحميل كاملة
  const updateProduct = useCallback(async (productId, updates) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      // تحديث في الكاش المحلي
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.id === productId ? { ...p, ...updates } : p
        )
      }));

      // تنظيف الكاش العالمي للتحديث في المرة القادمة
      globalCache.delete('complete_inventory');

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث المنتج بنجاح"
      });

      return true;
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, []);

  // تحديث طلب محدد
  const updateOrder = useCallback(async (orderId, updates) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', orderId);

      if (error) throw error;

      setData(prev => ({
        ...prev,
        orders: prev.orders.map(o => 
          o.id === orderId ? { ...o, ...updates } : o
        )
      }));

      globalCache.delete('complete_inventory');
      return true;
    } catch (error) {
      toast({
        title: "خطأ في تحديث الطلب",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, []);

  // إضافة منتج جديد
  const addProduct = useCallback(async (productData) => {
    try {
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`
          *,
          categories(name, departments(name)),
          product_variants(
            *,
            colors(name, hex_code),
            sizes(name, display_order)
          )
        `)
        .single();

      if (error) throw error;

      setData(prev => ({
        ...prev,
        products: [newProduct, ...prev.products]
      }));

      globalCache.delete('complete_inventory');
      
      toast({
        title: "تم إضافة المنتج",
        description: "تم إضافة المنتج بنجاح"
      });

      return newProduct;
    } catch (error) {
      toast({
        title: "خطأ في إضافة المنتج",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, []);

  // حسابات محسنة ومخزنة مؤقتاً
  const calculations = useMemo(() => {
    if (data.loading) return {};

    return {
      totalProducts: data.products.length,
      totalOrders: data.orders.length,
      totalCustomers: data.customers.length,
      
      // حالات الطلبات
      pendingOrders: data.orders.filter(o => o.status === 'pending').length,
      completedOrders: data.orders.filter(o => o.status === 'completed').length,
      totalRevenue: data.orders
        .filter(o => o.status === 'completed')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0),
      
      // إحصائيات المخزون
      totalVariants: data.products.reduce((sum, p) => 
        sum + (p.product_variants?.length || 0), 0),
      lowStockProducts: data.products.filter(p => 
        p.product_variants?.some(v => v.stock_quantity < 5)
      ).length,
      
      // أرباح
      totalProfits: data.profits.reduce((sum, p) => sum + (p.profit_amount || 0), 0),
      pendingProfits: data.profits
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + (p.profit_amount || 0), 0)
    };
  }, [data]);

  // تحميل أولي
  useEffect(() => {
    fetchCompleteInventory();
  }, [fetchCompleteInventory]);

  // إعداد Real-time updates
  useEffect(() => {
    const channel = supabase.channel('inventory_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => refreshData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => refreshData()
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' }, 
        () => refreshData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refreshData]);

  return {
    // البيانات الأساسية
    ...data,
    
    // الحسابات المحسنة
    calculations,
    
    // العمليات
    refreshData,
    updateProduct,
    updateOrder,
    addProduct,
    
    // حالة النظام
    isReady: !data.loading && !data.error,
    hasData: data.products.length > 0
  };
};

export default useUnifiedInventoryData;