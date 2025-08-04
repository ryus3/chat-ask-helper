import { useOptimizedData } from './useOptimizedData';

// Hook مبسط للتوافق مع المكونات الموجودة
// يعيد توجيه إلى النظام المحسن الجديد

/**
 * Hook للتوافق مع المكونات الموجودة
 * يستخدم النظام المحسن الجديد
 */
export const useUnifiedData = (dataTypes) => {
  return useOptimizedData(dataTypes);
};

export default useUnifiedData;