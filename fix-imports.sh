#!/bin/bash

# Script مؤقت لإصلاح جميع استيرادات customSupabaseClient

# سنقوم بإنشاء ملف customSupabaseClient مؤقت يعيد توجيه إلى الملف الصحيح
echo "export { supabase } from '@/integrations/supabase/client';" > src/lib/customSupabaseClient.js