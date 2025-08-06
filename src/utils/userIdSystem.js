/**
 * نظام معرفات المستخدمين - ID صغير كمعرف أساسي
 * الاحتفاظ بنظام الأدوار والصلاحيات المتقدم الحالي
 */

// تنسيقات معرفات المستخدمين
export const ID_FORMATS = {
  // المعرف الصغير الرئيسي للموظف (يحل محل UUID في كل العمليات)
  EMPLOYEE_ID: 'employee_id',     // مثل: 1001, 1002, 9999 - المعرف الأساسي لكل شيء
  
  // UUID احتياطي للمصادقة فقط
  AUTH_UUID: 'auth_uuid',         // مثل: 550e8400-e29b-41d4-a716-446655440000
  
  // رمز نصي للموظف للعرض
  EMPLOYEE_CODE: 'employee_code', // مثل: EMP001, EMP002, EMP999
  
  // رمز التليغرام المولد تلقائياً
  TELEGRAM_CODE: 'telegram_code', // مثل: TG_1001_2024, TG_1002_2024
};

/**
 * توليد المعرف الرقمي الصغير للموظف (المعرف الأساسي)
 */
export const generateEmployeeId = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('employee_id')
      .order('employee_id', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextId = 1001; // نبدأ من 1001
    if (data && data.length > 0 && data[0].employee_id) {
      nextId = data[0].employee_id + 1;
    }

    return nextId;
  } catch (error) {
    console.error('خطأ في توليد معرف الموظف:', error);
    return Math.floor(Math.random() * 9000) + 1000; // رقم عشوائي من 1000-9999
  }
};

/**
 * توليد رمز الموظف النصي بناء على المعرف الرقمي
 */
export const generateEmployeeCode = (employeeId) => {
  return `EMP${employeeId.toString().padStart(3, '0')}`;
};

/**
 * توليد رمز التليغرام للموظف بناء على المعرف الرقمي
 */
export const generateTelegramCode = (employeeId) => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `TG_${employeeId}_${year}_${randomSuffix}`;
};

/**
 * إعداد جميع معرفات المستخدم الجديد
 */
export const setupUserIds = async (supabase, authUuid, isFirstUser = false) => {
  try {
    // توليد المعرف الرقمي الأساسي
    const employeeId = isFirstUser ? 1001 : await generateEmployeeId(supabase);
    
    // توليد باقي المعرفات بناء على المعرف الرقمي
    const employeeCode = generateEmployeeCode(employeeId);
    const telegramCode = generateTelegramCode(employeeId);

    // تحديث البروفايل بالمعرفات الجديدة (employee_id هو المعرف الأساسي)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        employee_id: employeeId,        // المعرف الأساسي
        employee_code: employeeCode,    // للعرض
        telegram_code: telegramCode,    // للتليغرام
        auth_uuid: authUuid            // UUID احتياطي للمصادقة فقط
      })
      .eq('user_id', authUuid);

    if (updateError) throw updateError;

    // إنشاء سجل في جدول التليغرام
    const { error: telegramError } = await supabase
      .from('telegram_employee_codes')
      .insert({
        user_id: authUuid,
        employee_id: employeeId,
        employee_code: telegramCode,
        is_active: true
      });

    if (telegramError) {
      console.warn('تحذير: خطأ في إنشاء سجل التليغرام:', telegramError);
    }

    return {
      employeeId,
      employeeCode,
      telegramCode,
      success: true
    };
  } catch (error) {
    console.error('خطأ في إعداد معرفات المستخدم:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * جلب جميع معرفات المستخدم
 */
export const getUserIds = (user) => {
  return {
    // المعرف الرقمي الأساسي (يستخدم في كل العمليات)
    employeeId: user?.employee_id,
    
    // UUID احتياطي للمصادقة فقط
    authUuid: user?.id || user?.user_id || user?.auth_uuid,
    
    // معرف الموظف النصي (للعرض)
    employeeCode: user?.employee_code,
    
    // رمز التليغرام
    telegramCode: user?.telegram_code,
    
    // اسم المستخدم
    username: user?.username,
    
    // الاسم الكامل
    fullName: user?.full_name
  };
};

/**
 * التحقق من صحة معرف الموظف الرقمي
 */
export const validateEmployeeId = (id) => {
  return typeof id === 'number' && id >= 1000 && id <= 9999;
};

/**
 * التحقق من صحة رمز الموظف النصي
 */
export const validateEmployeeCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  const pattern = /^EMP\d{3,}$/;
  return pattern.test(code);
};

/**
 * البحث عن مستخدم بأي معرف (المعرف الرقمي له الأولوية)
 */
export const findUserByAnyId = async (supabase, identifier) => {
  try {
    let query = supabase
      .from('profiles')
      .select('*');

    // التحقق من نوع المعرف والبحث وفقاً له
    if (!isNaN(identifier) && validateEmployeeId(parseInt(identifier))) {
      // البحث بالمعرف الرقمي الأساسي
      query = query.eq('employee_id', parseInt(identifier));
    } else if (validateEmployeeCode(identifier)) {
      query = query.eq('employee_code', identifier);
    } else if (identifier.includes('@')) {
      query = query.eq('email', identifier);
    } else if (identifier.startsWith('TG_')) {
      query = query.eq('telegram_code', identifier);
    } else {
      // البحث في اسم المستخدم أو UUID
      query = query.or(`username.eq.${identifier},user_id.eq.${identifier},auth_uuid.eq.${identifier}`);
    }

    const { data, error } = await query.maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('خطأ في البحث عن المستخدم:', error);
    return null;
  }
};

export default {
  ID_FORMATS,
  generateEmployeeId,
  generateEmployeeCode,
  generateTelegramCode,
  setupUserIds,
  getUserIds,
  validateEmployeeId,
  validateEmployeeCode,
  findUserByAnyId
};