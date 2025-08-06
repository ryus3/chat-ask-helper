import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { User, UserCheck, UserX, Settings, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const UserCard = ({ user, onApprove, onReject }) => {
  const handleDirectApprove = async () => {
    try {
      // تفعيل المستخدم مع صلاحيات أساسية
      await onApprove(user.id, {
        is_active: true,
        role: 'employee'
      });
    } catch (error) {
      console.error('خطأ في الموافقة المباشرة:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء الموافقة",
        variant: "destructive"
      });
    }
  };

  const handleDirectReject = async () => {
    try {
      await onReject(user.id);
    } catch (error) {
      console.error('خطأ في الرفض المباشر:', error);
      toast({
        title: "خطأ", 
        description: "حدث خطأ أثناء الرفض",
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <Card className="border border-muted hover:border-primary/20 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user.full_name?.charAt(0) || user.username?.charAt(0) || 'م'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-sm">{user.full_name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {user.role === 'admin' ? 'مدير' : 'موظف'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>المستخدم: {user.username}</p>
                  <p>الإيميل: {user.email}</p>
                  <p>رقم الموظف: {user.employee_id}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleDirectApprove}
                className="text-xs bg-green-600 hover:bg-green-700"
              >
                <UserCheck className="w-3 h-3 ml-1" />
                موافقة
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDirectReject}
                className="text-xs"
              >
                <UserX className="w-3 h-3 ml-1" />
                رفض
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const PendingRegistrations = ({ onClose }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // جلب طلبات التسجيل المعلقة
  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', false)
        .eq('role', 'employee')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingUsers(users || []);
    } catch (error) {
      console.error('خطأ في جلب طلبات التسجيل:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل طلبات التسجيل",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId, data) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      console.log('=== بدء عملية الموافقة ===');
      console.log('معرف المستخدم:', userId);
      console.log('بيانات الموافقة:', data);
      
      // تحديث حالة المستخدم في قاعدة البيانات
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          is_active: true,
          role: data.role || 'employee'
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      // إضافة الصلاحيات الأساسية
      const basicPermissions = [
        'view_all_data',
        'manage_products', 
        'view_orders',
        'create_orders'
      ];

      for (const permission of basicPermissions) {
        await supabase
          .from('user_permissions')
          .insert({
            user_id: userId,
            permission_type: permission,
            is_granted: true
          });
      }
      
      toast({
        title: "تمت الموافقة ✅",
        description: "تم تفعيل حساب الموظف بنجاح",
        variant: "default"
      });
      
      // إعادة تحميل القائمة
      await fetchPendingUsers();
      
      console.log('=== نجحت عملية الموافقة ===');
    } catch (error) {
      console.error('=== فشلت عملية الموافقة ===', error);
      toast({
        title: "خطأ في الموافقة",
        description: error.message || "حدث خطأ أثناء الموافقة على الحساب",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (userId) => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    try {
      console.log('=== بدء عملية الرفض ===');
      console.log('رفض المستخدم:', userId);
      
      // حذف المستخدم من قاعدة البيانات
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      toast({
        title: "تم الرفض ❌",
        description: "تم رفض طلب التسجيل",
        variant: "default"
      });
      
      // إعادة تحميل القائمة
      await fetchPendingUsers();
      
      console.log('=== نجحت عملية الرفض ===');
    } catch (error) {
      console.error('=== فشلت عملية الرفض ===', error);
      toast({
        title: "خطأ في الرفض",
        description: error.message || "حدث خطأ أثناء رفض الطلب",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-lg shadow-xl max-w-md w-full"
        >
          <Card className="border-0">
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">جاري تحميل طلبات التسجيل...</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  if (!pendingUsers?.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-background rounded-lg shadow-xl max-w-md w-full"
        >
          <Card className="border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">طلبات التسجيل</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="text-center py-8">
              <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد طلبات تسجيل جديدة</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
      >
        <Card className="border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">
                طلبات التسجيل الجديدة ({pendingUsers.length})
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            <AnimatePresence>
              {pendingUsers.map(user => (
                <UserCard
                  key={user.id}
                  user={user}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default PendingRegistrations;