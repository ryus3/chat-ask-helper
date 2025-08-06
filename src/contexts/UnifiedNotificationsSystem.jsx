import { useEffect } from 'react';
import { useAuth } from './UnifiedAuthContext';
import { useNotifications } from './NotificationsContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * نظام إشعارات موحد ومحسن للأداء
 * يدير Real-time subscriptions وإنشاء الإشعارات بكفاءة
 */
export const useUnifiedNotificationsSystem = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!supabase || !user || !addNotification) {
      return;
    }
    
    const isAdmin = user.role === 'admin';
    if (!isAdmin) {
      return; // إشعارات المدير فقط للأحداث العامة
    }
    
    // اشتراك واحد للملفات الشخصية الجديدة
    const profilesChannel = supabase
      .channel('unified-profiles-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          if (payload.new.status === 'pending') {
            addNotification({
              type: 'new_registration',
              title: 'طلب تسجيل جديد',
              message: `الموظف ${payload.new.full_name || 'الجديد'} سجل في النظام.`,
              icon: 'UserPlus',
              color: 'purple',
              data: { id: payload.new.id },
              user_id: null, // للمدير فقط
            });
          }
        }
      )
      .subscribe();

    // اشتراك واحد للطلبات الجديدة
    const ordersChannel = supabase
      .channel('unified-orders-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          try {
            // جلب اسم المستخدم بكفاءة
            const { data: userData } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', payload.new.created_by)
              .single();
            
            const userName = userData?.full_name || 'مستخدم غير معروف';
            
            addNotification({
              type: 'new_order',
              title: 'طلب جديد',
              message: `طلب رقم ${payload.new.order_number} من ${userName}`,
              icon: 'ShoppingCart',
              color: 'blue',
              data: { 
                orderId: payload.new.id, 
                orderNumber: payload.new.order_number,
                employeeName: userName
              },
              user_id: null, // للمدير فقط
            });
          } catch (error) {
            console.error('Error in order notification:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(ordersChannel);
    };
    
  }, [user, addNotification]);

  return null;
};

// مكون إدارة الإشعارات الموحد
const UnifiedNotificationsSystem = () => {
  useUnifiedNotificationsSystem();
  return null;
};

export default UnifiedNotificationsSystem;