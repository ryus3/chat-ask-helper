/**
 * 🎯 مزود البيانات الموحد - المصدر الوحيد للحقيقة
 * يحل مشكلة التناقض نهائياً - جميع الصفحات تستخدم نفس البيانات
 */

import React, { createContext, useContext } from 'react';
import { useUnifiedInventoryData } from '@/hooks/useUnifiedInventoryData';

const UnifiedInventoryContext = createContext(null);

export const useUnifiedInventory = () => {
  const context = useContext(UnifiedInventoryContext);
  if (!context) {
    throw new Error('useUnifiedInventory must be used within UnifiedInventoryProvider');
  }
  return context;
};

export const UnifiedInventoryProvider = ({ children }) => {
  const inventoryData = useUnifiedInventoryData();

  return (
    <UnifiedInventoryContext.Provider value={inventoryData}>
      {children}
    </UnifiedInventoryContext.Provider>
  );
};

export default UnifiedInventoryProvider;