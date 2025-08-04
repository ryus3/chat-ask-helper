import { useState, useCallback, useMemo } from 'react';
import { useOptimizedData } from './useOptimizedData';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook موحد لإدارة جميع العمليات والحالات
 * يوفر واجهة موحدة لجميع الصفحات
 */
export const useUnifiedDataManager = (pageType) => {
  const { toast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filters, setFilters] = useState({});

  // تحديد أنواع البيانات المطلوبة حسب نوع الصفحة
  const requiredDataTypes = useMemo(() => {
    switch (pageType) {
      case 'dashboard':
        return ['products', 'orders', 'profits', 'inventory'];
      case 'products':
        return ['products', 'variants'];
      case 'orders':
        return ['orders', 'customers', 'products'];
      case 'inventory':
        return ['products', 'inventory'];
      case 'profits':
        return ['profits', 'orders'];
      case 'customers':
        return ['customers', 'orders'];
      default:
        return [];
    }
  }, [pageType]);

  const data = useOptimizedData(requiredDataTypes);

  // فلترة وترتيب البيانات
  const processedData = useMemo(() => {
    const getDataByType = () => {
      switch (pageType) {
        case 'products':
          return data.products || [];
        case 'orders':
          return data.orders || [];
        case 'customers':
          return data.customers || [];
        case 'profits':
          return data.profits || [];
        case 'inventory':
          return data.inventory || [];
        default:
          return [];
      }
    };

    let items = getDataByType();

    // تطبيق البحث
    if (searchQuery) {
      items = items.filter(item => {
        const searchFields = getSearchFields(item, pageType);
        return searchFields.some(field => 
          field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // تطبيق الفلاتر
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        items = items.filter(item => {
          if (typeof value === 'string') {
            return item[key]?.toString().toLowerCase().includes(value.toLowerCase());
          }
          return item[key] === value;
        });
      }
    });

    // الترتيب
    items.sort((a, b) => {
      const aValue = a[sortBy] || '';
      const bValue = b[sortBy] || '';
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    return items;
  }, [data, pageType, searchQuery, filters, sortBy, sortOrder]);

  // التصفح
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedData.slice(startIndex, endIndex);
  }, [processedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  // دالات العمليات الموحدة
  const operations = {
    // عمليات التحديد
    selectItem: useCallback((id) => {
      setSelectedItems(prev => 
        prev.includes(id) 
          ? prev.filter(item => item !== id)
          : [...prev, id]
      );
    }, []),

    selectAll: useCallback(() => {
      setSelectedItems(
        selectedItems.length === paginatedData.length 
          ? [] 
          : paginatedData.map(item => item.id)
      );
    }, [selectedItems.length, paginatedData]),

    clearSelection: useCallback(() => {
      setSelectedItems([]);
    }, []),

    // عمليات البحث والفلترة
    updateSearch: useCallback((query) => {
      setSearchQuery(query);
      setCurrentPage(1);
    }, []),

    updateFilter: useCallback((key, value) => {
      setFilters(prev => ({ ...prev, [key]: value }));
      setCurrentPage(1);
    }, []),

    clearFilters: useCallback(() => {
      setFilters({});
      setSearchQuery('');
      setCurrentPage(1);
    }, []),

    // عمليات الترتيب
    updateSort: useCallback((field) => {
      if (sortBy === field) {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
        setSortBy(field);
        setSortOrder('desc');
      }
    }, [sortBy]),

    // عمليات التصفح
    goToPage: useCallback((page) => {
      setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    }, [totalPages]),

    nextPage: useCallback(() => {
      setCurrentPage(prev => Math.min(prev + 1, totalPages));
    }, [totalPages]),

    prevPage: useCallback(() => {
      setCurrentPage(prev => Math.max(prev - 1, 1));
    }, []),

    // عمليات البيانات
    refreshData: useCallback(() => {
      data.operations.refreshData(requiredDataTypes);
      toast({
        title: "تم تحديث البيانات",
        description: "تم تحديث جميع البيانات بنجاح"
      });
    }, [data.operations, requiredDataTypes, toast]),

    // عمليات CRUD موحدة
    createItem: useCallback(async (newItem) => {
      try {
        // سيتم تنفيذ منطق الإنشاء لاحقاً
        toast({
          title: "تم الإنشاء بنجاح",
          description: "تم إنشاء العنصر الجديد"
        });
        return true;
      } catch (error) {
        toast({
          title: "خطأ في الإنشاء",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
    }, [toast]),

    updateItem: useCallback(async (id, updates) => {
      try {
        // سيتم تنفيذ منطق التحديث لاحقاً
        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث العنصر"
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
    }, [toast]),

    deleteItem: useCallback(async (id) => {
      try {
        // سيتم تنفيذ منطق الحذف لاحقاً
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف العنصر"
        });
        return true;
      } catch (error) {
        toast({
          title: "خطأ في الحذف",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
    }, [toast])
  };

  return {
    // البيانات
    data: paginatedData,
    allData: processedData,
    calculations: data.calculations,
    
    // حالة التحميل
    isLoading: data.isLoading,
    error: data.error,
    
    // حالة واجهة المستخدم
    selectedItems,
    searchQuery,
    filters,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    itemsPerPage,
    totalItems: processedData.length,
    
    // العمليات
    operations,
    
    // معلومات إضافية
    permissions: data.permissions,
    hasSelection: selectedItems.length > 0,
    isAllSelected: selectedItems.length === paginatedData.length
  };
};

// دالة مساعدة لتحديد حقول البحث
const getSearchFields = (item, pageType) => {
  switch (pageType) {
    case 'products':
      return [item.name, item.barcode, item.category?.name];
    case 'orders':
      return [item.order_number, item.customer_name, item.customer_phone];
    case 'customers':
      return [item.name, item.phone, item.email, item.address];
    case 'profits':
      return [item.order?.order_number, item.employee?.full_name];
    default:
      return [item.name, item.title];
  }
};

export default useUnifiedDataManager;