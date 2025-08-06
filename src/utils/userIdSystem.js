/**
 * نظام توحيد هويات المستخدمين - نظام شامل ومتكامل
 */

// تنسيقات معرفات المستخدمين
export const ID_FORMATS = {
  // UUID الأساسي من Supabase Auth
  AUTH_UUID: 'auth_uuid',      // مثل: 550e8400-e29b-41d4-a716-446655440000
  
  // المعرف الصغير للموظف - تنسيق EMP + رقم
  EMPLOYEE_CODE: 'employee_code', // مثل: EMP001, EMP002, EMP999
  
  // رمز التليغرام المولد تلقائياً
  TELEGRAM_CODE: 'telegram_code', // مثل: TG_EMP001_2024, TG_EMP002_2024
  
  // معرف رقمي صغير للعرض
  SMALL_ID: 'small_id'        // مثل: 1001, 1002, 9999
};

/**
 * توليد معرف الموظف بتنسيق EMP + رقم
 */
export const generateEmployeeCode = async (supabase) => {
  try {
    // الحصول على آخر رقم موظف
    const { data, error } = await supabase
      .from('profiles')
      .select('employee_code')
      .like('employee_code', 'EMP%')
      .order('employee_code', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextNumber = 1;
    if (data && data.length > 0) {
      const lastCode = data[0].employee_code;
      const lastNumber = parseInt(lastCode.replace('EMP', ''));
      nextNumber = lastNumber + 1;
    }

    // تنسيق الرقم بـ 3 خانات على الأقل
    return `EMP${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('خطأ في توليد رمز الموظف:', error);
    // في حالة الخطأ، توليد رقم عشوائي
    const randomNum = Math.floor(Math.random() * 999) + 1;
    return `EMP${randomNum.toString().padStart(3, '0')}`;
  }
};

/**
 * توليد رمز التليغرام للموظف
 */
export const generateTelegramCode = (employeeCode) => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `TG_${employeeCode}_${year}_${randomSuffix}`;
};

/**
 * توليد معرف رقمي صغير
 */
export const generateSmallId = async (supabase) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('small_id')
      .order('small_id', { ascending: false })
      .limit(1);

    if (error) throw error;

    let nextId = 1001; // نبدأ من 1001
    if (data && data.length > 0 && data[0].small_id) {
      nextId = data[0].small_id + 1;
    }

    return nextId;
  } catch (error) {
    console.error('خطأ في توليد المعرف الصغير:', error);
    return Math.floor(Math.random() * 9000) + 1000; // رقم عشوائي من 1000-9999
  }
};

/**
 * إعداد جميع معرفات المستخدم الجديد
 */
export const setupUserIds = async (supabase, userId, isFirstUser = false) => {
  try {
    // توليد جميع المعرفات
    const employeeCode = isFirstUser ? 'EMP001' : await generateEmployeeCode(supabase);
    const smallId = isFirstUser ? 1001 : await generateSmallId(supabase);
    const telegramCode = generateTelegramCode(employeeCode);

    // تحديث البروفايل بالمعرفات الجديدة
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        employee_code: employeeCode,
        small_id: smallId,
        telegram_code: telegramCode
      })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    // إنشاء سجل في جدول التليغرام
    const { error: telegramError } = await supabase
      .from('telegram_employee_codes')
      .insert({
        user_id: userId,
        employee_code: telegramCode,
        is_active: true
      });

    if (telegramError) {
      console.warn('تحذير: خطأ في إنشاء سجل التليغرام:', telegramError);
    }

    return {
      employeeCode,
      smallId,
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
    // UUID الأساسي من المصادقة
    authUuid: user?.id || user?.user_id,
    
    // معرف الموظف (EMP + رقم)
    employeeCode: user?.employee_code,
    
    // المعرف الرقمي الصغير
    smallId: user?.small_id,
    
    // رمز التليغرام
    telegramCode: user?.telegram_code,
    
    // اسم المستخدم
    username: user?.username,
    
    // الاسم الكامل
    fullName: user?.full_name
  };
};

/**
 * التحقق من صحة معرف الموظف
 */
export const validateEmployeeCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  
  // يجب أن يبدأ بـ EMP ويتبعه أرقام
  const pattern = /^EMP\d{3,}$/;
  return pattern.test(code);
};

/**
 * البحث عن مستخدم بأي معرف
 */
export const findUserByAnyId = async (supabase, identifier) => {
  try {
    let query = supabase
      .from('profiles')
      .select('*');

    // التحقق من نوع المعرف والبحث وفقاً له
    if (validateEmployeeCode(identifier)) {
      query = query.eq('employee_code', identifier);
    } else if (identifier.includes('@')) {
      query = query.eq('email', identifier);
    } else if (!isNaN(identifier)) {
      query = query.eq('small_id', parseInt(identifier));
    } else if (identifier.startsWith('TG_')) {
      query = query.eq('telegram_code', identifier);
    } else {
      // البحث في اسم المستخدم أو UUID
      query = query.or(`username.eq.${identifier},user_id.eq.${identifier}`);
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
  generateEmployeeCode,
  generateTelegramCode,
  generateSmallId,
  setupUserIds,
  getUserIds,
  validateEmployeeCode,
  findUserByAnyId
};