import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast.js';
import { supabase } from '@/integrations/supabase/client';

const UnifiedAuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(UnifiedAuthContext);
  if (!context) {
    return {
      user: null,
      profile: null,
      session: null,
      loading: true,
      login: async () => ({ success: false, error: 'غير متصل بالنظام' }),
      register: async () => ({ success: false, error: 'غير متصل بالنظام' }),
      logout: async () => ({ success: false, error: 'غير متصل بالنظام' }),
      hasPermission: () => false,
      isAdmin: false
    };
  }
  return context;
};

export const UnifiedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // جلب بيانات البروفايل
  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('خطأ في جلب البروفايل:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('خطأ في جلب البروفايل:', error);
      return null;
    }
  }, []);

  // إعداد حالة المصادقة
  useEffect(() => {
    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // جلب البروفايل عند تسجيل الدخول
          setTimeout(async () => {
            const profileData = await fetchProfile(session.user.id);
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // التحقق من الجلسة الحالية
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(async () => {
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // دالة تسجيل الدخول
  const login = async (username, password) => {
    try {
      setLoading(true);

      // التحقق من وجود اسم المستخدم
      const { data: userData } = await supabase.rpc('get_user_by_username', {
        username_input: username
      });

      if (!userData || userData.length === 0) {
        return {
          success: false,
          error: 'اسم المستخدم غير موجود'
        };
      }

      const user = userData[0];

      // تسجيل الدخول بالبريد الإلكتروني
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password
      });

      if (error) {
        return {
          success: false,
          error: 'كلمة المرور غير صحيحة'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return {
        success: false,
        error: 'حدث خطأ في تسجيل الدخول'
      };
    } finally {
      setLoading(false);
    }
  };

  // دالة التسجيل
  const register = async (username, fullName, email, password) => {
    try {
      setLoading(true);

      // التحقق من وجود اسم المستخدم
      const { data: exists } = await supabase.rpc('username_exists', {
        username_input: username
      });

      if (exists) {
        return {
          success: false,
          error: 'اسم المستخدم موجود بالفعل'
        };
      }

      // إنشاء حساب جديد
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username,
            full_name: fullName
          }
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message === 'User already registered' 
            ? 'البريد الإلكتروني مسجل بالفعل'
            : 'حدث خطأ في التسجيل'
        };
      }

      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "يمكنك الآن تسجيل الدخول"
      });

      return { success: true };
    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      return {
        success: false,
        error: 'حدث خطأ في التسجيل'
      };
    } finally {
      setLoading(false);
    }
  };

  // دالة تسجيل الخروج
  const logout = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return {
          success: false,
          error: 'حدث خطأ في تسجيل الخروج'
        };
      }

      return { success: true };
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
      return {
        success: false,
        error: 'حدث خطأ في تسجيل الخروج'
      };
    } finally {
      setLoading(false);
    }
  };

  // دالة التحقق من الصلاحيات
  const hasPermission = (permission) => {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    
    // يمكن إضافة منطق أكثر تعقيداً للصلاحيات هنا
    return false;
  };

  // التحقق من كون المستخدم مدير
  const isAdmin = profile?.role === 'admin';

  const value = {
    user,
    profile,
    session,
    loading,
    login,
    register,
    logout,
    hasPermission,
    isAdmin
  };

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  );
};