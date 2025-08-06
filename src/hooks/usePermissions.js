import { useAuth } from '@/contexts/UnifiedAuthContext';

/**
 * Hook مبسط للوصول للصلاحيات والأدوار
 * يستخدم النظام الجديد الموحد فقط
 */
export const usePermissions = () => {
  const { user, profile, loading, hasPermission, isAdmin } = useAuth();

  return {
    // المستخدم
    user,
    profile,
    loading,

    // الأدوار
    isAdmin,
    isDepartmentManager: profile?.role === 'department_manager',
    isSalesEmployee: profile?.role === 'sales_employee',
    isWarehouseEmployee: profile?.role === 'warehouse_employee',
    isCashier: profile?.role === 'cashier',
    hasRole: (role) => profile?.role === role,

    // الصلاحيات
    hasPermission,
    canViewAllData: isAdmin,
    canManageEmployees: isAdmin,
    canManageFinances: isAdmin,

    // فلترة البيانات
    filterDataByUser: (data) => {
      if (isAdmin) return data;
      return data.filter(item => item.user_id === user?.id);
    },
    filterProductsByPermissions: (products) => {
      if (isAdmin) return products;
      // يمكن إضافة منطق فلترة المنتجات هنا
      return products;
    },
    getEmployeeStats: () => {
      return { total: 0, personal: 0 };
    },

    // معلومات إضافية
    userRoles: profile?.role ? [profile.role] : [],
    userPermissions: [],
    productPermissions: {},
  };
};

export default usePermissions;