import React, { useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/UnifiedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, ArrowRight, Shield, Users } from 'lucide-react';
import EmployeeList from '@/components/manage-employees/EmployeeList';
import UnifiedEmployeeDialog from '@/components/manage-employees/UnifiedEmployeeDialog';
import PendingRegistrations from '@/components/dashboard/PendingRegistrations';
import { toast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import UpdateRolePermissionsDialog from '@/components/manage-employees/UpdateRolePermissionsDialog';

const ManageEmployeesPage = () => {
  const { profile, isAdmin } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ searchTerm: '', status: 'all', role: 'all' });
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);
  const [showPendingRegistrations, setShowPendingRegistrations] = useState(false);

  // جلب جميع المستخدمين من قاعدة البيانات
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAllUsers(users || []);
      setPendingUsers(users?.filter(u => u.role === 'employee' && u.is_active === false) || []);
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل قائمة المستخدمين",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // تحميل البيانات عند بدء الصفحة
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  // التحقق من الصلاحيات
  if (!isAdmin) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">ليس لديك صلاحية للوصول لهذه الصفحة</p>
      </div>
    );
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };
  
  const handleSelectFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    return allUsers.filter(user => {
      const searchTermMatch = (user.full_name?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
                              (user.email?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
                              (user.username?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase());
      
      const statusMatch = filters.status === 'all' || 
                         (filters.status === 'active' && user.is_active === true) ||
                         (filters.status === 'pending' && user.is_active === false);
      
      const roleMatch = filters.role === 'all' || user.role === filters.role;
      
      return searchTermMatch && statusMatch && roleMatch;
    }).sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
  }, [allUsers, filters]);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleAddNew = () => {
    toast({
      title: "لإضافة موظف جديد",
      description: "اطلب منه التسجيل في النظام ثم قم بالموافقة عليه من لوحة التحكم.",
    });
  };

  return (
    <>
      <Helmet>
        <title>إدارة الموظفين - RYUS</title>
        <meta name="description" content="إدارة صلاحيات وحسابات الموظفين" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/settings')}>
                <ArrowRight className="h-4 w-4 ml-2" />
                رجوع
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-text">إدارة الموظفين</h1>
              <p className="text-muted-foreground mt-1">عرض وتعديل صلاحيات وحسابات الموظفين</p>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingUsers.length > 0 && (
              <Button variant="outline" onClick={() => setShowPendingRegistrations(true)}>
                <Users className="w-4 h-4 ml-2" />
                طلبات جديدة ({pendingUsers.length})
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsBulkUpdateOpen(true)}>
                <Shield className="w-4 h-4 ml-2" />
                تعديل صلاحيات جماعي
            </Button>
            <Button onClick={handleAddNew}>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-xl p-4 border border-border grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="البحث بالاسم، المستخدم، أو الإيميل..." 
              name="searchTerm"
              value={filters.searchTerm} 
              onChange={handleFilterChange} 
              className="pr-10" 
            />
          </div>
          <Select name="status" value={filters.status} onValueChange={(v) => handleSelectFilterChange('status', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الحالات</SelectItem>
              <SelectItem value="active">نشط</SelectItem>
              <SelectItem value="pending">قيد المراجعة</SelectItem>
              <SelectItem value="suspended">معلق</SelectItem>
            </SelectContent>
          </Select>
            <Select name="role" value={filters.role} onValueChange={(v) => handleSelectFilterChange('role', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأدوار</SelectItem>
                <SelectItem value="admin">المدير العام</SelectItem>
                <SelectItem value="department_manager">مدير القسم</SelectItem>
                <SelectItem value="employee">موظف</SelectItem>
                <SelectItem value="sales_employee">موظف مبيعات</SelectItem>
                <SelectItem value="warehouse_employee">موظف مخزن</SelectItem>
                <SelectItem value="cashier">كاشير</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <EmployeeList 
              users={filteredUsers} 
              onEdit={handleEdit}
            />
          )}

          {editingEmployee && (
            <UnifiedEmployeeDialog
                employee={editingEmployee}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
            />
          )}
          
          <UpdateRolePermissionsDialog 
              open={isBulkUpdateOpen}
              onOpenChange={setIsBulkUpdateOpen}
          />

          {showPendingRegistrations && (
            <PendingRegistrations 
              onClose={() => {
                setShowPendingRegistrations(false);
                fetchUsers(); // إعادة تحميل البيانات عند الإغلاق
              }} 
            />
          )}
        </div>
      </>
    );
  };
};

export default ManageEmployeesPage;