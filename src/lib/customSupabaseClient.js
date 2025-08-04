import { createClient } from '@supabase/supabase-js';

// استخدام إعدادات Supabase الجديدة
const supabaseUrl = 'https://iuyuoiqavzbtxxkkrkbp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1eXVvaXFhdnpidHh4a2tya2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNDQyMzksImV4cCI6MjA2OTkyMDIzOX0.IIKXjkZUEtiRbpp_odjDe5H_pHuJ4Z8yymQVQrZ-Ags';

// إنشاء client مع إعدادات محسنة لتجنب مشاكل cross-fetch
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined
  },
  global: {
    // استخدام native fetch بدلاً من cross-fetch
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }
  }
});