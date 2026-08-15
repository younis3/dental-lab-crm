export type Lang = 'en' | 'he' | 'ar';

export const LANGS: { key: Lang; label: string; short: string }[] = [
  { key: 'en', label: 'English', short: 'EN' },
  { key: 'he', label: 'עברית', short: 'עב' },
  { key: 'ar', label: 'العربية', short: 'ع' },
];

export const isRtl = (lang: Lang) => lang === 'he' || lang === 'ar';

export const LOCALES: Record<Lang, string> = { en: 'en-US', he: 'he-IL', ar: 'ar-EG' };

/** Tenant-authored copy that ships in every language. */
export type LocalizedText = Record<Lang, string>;
/** Plain strings stay untranslated — used for proper nouns, ids and filenames. */
export type MaybeLocalized = string | LocalizedText;

export function localized(value: MaybeLocalized, lang: Lang): string {
  return typeof value === 'string' ? value : value[lang];
}

/** Replaces `{name}` placeholders so word order can differ per language. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

export type UiStrings = {
  // login
  loginTagline: string;
  loginWelcome: string;
  loginSubtitle: string;
  loginPhoneLabel: string;
  loginPhonePlaceholder: string;
  loginPasswordLabel: string;
  loginPasswordPlaceholder: string;
  loginShowPassword: string;
  loginHidePassword: string;
  loginSendCode: string;
  loginFillDemo: string;
  loginVerifyTitle: string;
  loginVerifySubtitle: string;
  loginDemoCode: string;
  loginVerifyAction: string;
  loginVerifying: string;
  loginChangeNumber: string;
  loginResendIn: string;
  loginResend: string;
  loginSecureNote: string;
  loginStepStatus: string;
  loginErrorCredentials: string;
  loginErrorCode: string;
  loginErrorExpired: string;

  // navigation
  navHome: string;
  navDashboard: string;
  navOrders: string;
  navInbox: string;
  navFiles: string;
  navAnalytics: string;
  navFinancials: string;
  navCourier: string;
  navTeam: string;

  // drawer
  drawerWorkspace: string;
  drawerComingSoon: string;
  drawerSoonBadge: string;
  drawerOpenMenu: string;
  drawerCloseMenu: string;
  drawerOpenProfile: string;
  drawerLanguage: string;
  drawerAppearance: string;
  drawerStatusOk: string;
  drawerLogout: string;
  themeAuto: string;
  themeLight: string;
  themeDark: string;

  // dashboard
  dashGreetingMorning: string;
  dashGreetingAfternoon: string;
  dashGreetingEvening: string;
  dashTodayAtLab: string;
  dashCasesInProduction: string;
  dashOnTime: string;
  dashRushJobs: string;
  dashPickups: string;
  dashNotifications: string;
  dashProfile: string;
  dashAttentionOne: string;
  dashAttentionMany: string;
  dashAttentionAria: string;
  dashStatActive: string;
  dashStatActiveDelta: string;
  dashStatDue: string;
  dashStatDueDelta: string;
  dashStatDelivered: string;
  dashStatDeliveredDelta: string;
  dashStatOutstanding: string;
  dashStatOutstandingDelta: string;
  dashPipeline: string;
  dashInProgress: string;
  dashRecentActivity: string;
  dashSeeAll: string;
  quickNewCase: string;
  quickCourier: string;
  quickScan: string;
  quickInvoice: string;

  // order stages
  stageReceived: string;
  stageDesign: string;
  stageProduction: string;
  stageQuality: string;
  stageCourier: string;
  stageDelivered: string;
  stageShortDesign: string;
  stageShortProduction: string;
  stageShortQuality: string;
  stageShortCourier: string;

  // orders
  ordersTitle: string;
  ordersSubtitle: string;
  ordersSearch: string;
  ordersClearSearch: string;
  ordersFilterSort: string;
  ordersFilterAll: string;
  ordersFilterRush: string;
  ordersFilterStarred: string;
  ordersRushBadge: string;
  ordersShade: string;
  ordersCaseAria: string;
  ordersStar: string;
  ordersUnstar: string;
  ordersEmptyTitle: string;
  ordersEmptyBody: string;

  // inbox
  inboxTitle: string;
  inboxUnreadSubtitle: string;
  inboxAllRead: string;
  inboxNewMessage: string;
  inboxFilterAll: string;
  inboxFilterUnread: string;
  inboxFilterPriority: string;
  inboxSupport: string;
  inboxSupportReply: string;
  inboxSupportAria: string;
  inboxActionRequired: string;
  inboxHighPriority: string;
  inboxConversationAria: string;
  inboxEmptyTitle: string;
  inboxEmptyBody: string;

  // files
  filesTitle: string;
  filesSubtitle: string;
  filesUpload: string;
  filesStorage: string;
  filesStorageUsed: string;
  filesFolders: string;
  filesManage: string;
  filesRecent: string;
  filesSeeAll: string;
  filesCount: string;
  filesFolderAria: string;
  filesMore: string;
};

export const UI_STRINGS: Record<Lang, UiStrings> = {
  en: {
    loginTagline: 'Precision restorations, from impression to delivery.',
    loginWelcome: 'Welcome back',
    loginSubtitle: 'Sign in to your lab workspace.',
    loginPhoneLabel: 'Phone number',
    loginPhonePlaceholder: 'Enter your phone number',
    loginPasswordLabel: 'Password',
    loginPasswordPlaceholder: 'Enter your password',
    loginShowPassword: 'Show password',
    loginHidePassword: 'Hide password',
    loginSendCode: 'Send verification code',
    loginFillDemo: 'Fill demo credentials',
    loginVerifyTitle: 'Verify it’s you',
    loginVerifySubtitle: 'Enter the {count}-digit code sent to your phone.',
    loginDemoCode: 'Demo code is {code}',
    loginVerifyAction: 'Verify and continue',
    loginVerifying: 'Verifying',
    loginChangeNumber: 'Change number',
    loginResendIn: 'Resend in {seconds}s',
    loginResend: 'Resend code',
    loginSecureNote: 'Encrypted session · Lab admin access only',
    loginStepStatus: 'Step {current} of {total}',
    loginErrorCredentials: 'That phone number and password do not match.',
    loginErrorCode: 'Incorrect code. The demo code is {code}.',
    loginErrorExpired: 'Your session expired. Please sign in again.',

    navHome: 'Home',
    navDashboard: 'Dashboard',
    navOrders: 'Orders',
    navInbox: 'Inbox',
    navFiles: 'Files',
    navAnalytics: 'Analytics',
    navFinancials: 'Financials',
    navCourier: 'Courier',
    navTeam: 'Team & roles',

    drawerWorkspace: 'Workspace',
    drawerComingSoon: 'Coming soon',
    drawerSoonBadge: 'Soon',
    drawerOpenMenu: 'Open menu',
    drawerCloseMenu: 'Close menu',
    drawerOpenProfile: 'Open profile',
    drawerLanguage: 'Language',
    drawerAppearance: 'Appearance',
    drawerStatusOk: 'All systems operational',
    drawerLogout: 'Log out',
    themeAuto: 'Auto',
    themeLight: 'Light',
    themeDark: 'Dark',

    dashGreetingMorning: 'Good morning',
    dashGreetingAfternoon: 'Good afternoon',
    dashGreetingEvening: 'Good evening',
    dashTodayAtLab: 'Today at the lab',
    dashCasesInProduction: 'cases in production',
    dashOnTime: 'on time',
    dashRushJobs: '{count} rush jobs',
    dashPickups: '{count} pickups',
    dashNotifications: 'Notifications',
    dashProfile: 'Your profile',
    dashAttentionOne: '1 case needs attention',
    dashAttentionMany: '{count} cases need attention',
    dashAttentionAria: 'Review cases that need attention',
    dashStatActive: 'Active cases',
    dashStatActiveDelta: '+{count} today',
    dashStatDue: 'Due this week',
    dashStatDueDelta: '{count} urgent',
    dashStatDelivered: 'Delivered',
    dashStatDeliveredDelta: '+{percent}%',
    dashStatOutstanding: 'Outstanding',
    dashStatOutstandingDelta: '{count} invoices',
    dashPipeline: 'Production pipeline',
    dashInProgress: 'In progress',
    dashRecentActivity: 'Recent activity',
    dashSeeAll: 'See all',
    quickNewCase: 'New case',
    quickCourier: 'Courier',
    quickScan: 'Scan file',
    quickInvoice: 'Invoice',

    stageReceived: 'Received',
    stageDesign: 'Design',
    stageProduction: 'In production',
    stageQuality: 'Quality check',
    stageCourier: 'Out for courier',
    stageDelivered: 'Delivered',
    stageShortDesign: 'Design',
    stageShortProduction: 'Production',
    stageShortQuality: 'Quality',
    stageShortCourier: 'Courier',

    ordersTitle: 'Orders',
    ordersSubtitle: '{shown} of {total} cases',
    ordersSearch: 'Search patient, case or clinic',
    ordersClearSearch: 'Clear search',
    ordersFilterSort: 'Filter and sort',
    ordersFilterAll: 'All',
    ordersFilterRush: 'Rush',
    ordersFilterStarred: 'Starred',
    ordersRushBadge: 'Rush',
    ordersShade: 'Shade {shade}',
    ordersCaseAria: 'Case {id} for {patient}',
    ordersStar: 'Add to starred',
    ordersUnstar: 'Remove from starred',
    ordersEmptyTitle: 'No cases found',
    ordersEmptyBody: 'Try a different search term or clear the active filter.',

    inboxTitle: 'Inbox',
    inboxUnreadSubtitle: '{count} unread conversations',
    inboxAllRead: 'You are all caught up',
    inboxNewMessage: 'New message',
    inboxFilterAll: 'All',
    inboxFilterUnread: 'Unread',
    inboxFilterPriority: 'Priority',
    inboxSupport: 'Lab support',
    inboxSupportReply: 'Typical reply in under 10 minutes',
    inboxSupportAria: 'Open lab support chat',
    inboxActionRequired: 'Action required',
    inboxHighPriority: 'High priority',
    inboxConversationAria: 'Conversation with {name}',
    inboxEmptyTitle: 'Nothing here',
    inboxEmptyBody: 'No conversations match this filter.',

    filesTitle: 'Files',
    filesSubtitle: 'Scans, photos and documents',
    filesUpload: 'Upload file',
    filesStorage: 'Lab storage',
    filesStorageUsed: '{used} of {total} used',
    filesFolders: 'Folders',
    filesManage: 'Manage',
    filesRecent: 'Recent uploads',
    filesSeeAll: 'See all',
    filesCount: '{count} files',
    filesFolderAria: '{name}, {count} files',
    filesMore: 'More options',
  },

  he: {
    loginTagline: 'שחזורים מדויקים, מההטבעה ועד המסירה.',
    loginWelcome: 'ברוך שובך',
    loginSubtitle: 'התחברו לסביבת העבודה של המעבדה.',
    loginPhoneLabel: 'מספר טלפון',
    loginPhonePlaceholder: 'הזינו מספר טלפון',
    loginPasswordLabel: 'סיסמה',
    loginPasswordPlaceholder: 'הזינו סיסמה',
    loginShowPassword: 'הצגת הסיסמה',
    loginHidePassword: 'הסתרת הסיסמה',
    loginSendCode: 'שליחת קוד אימות',
    loginFillDemo: 'מילוי פרטי הדגמה',
    loginVerifyTitle: 'אימות זהות',
    loginVerifySubtitle: 'הזינו את הקוד בן {count} הספרות שנשלח לטלפון שלכם.',
    loginDemoCode: 'קוד ההדגמה הוא {code}',
    loginVerifyAction: 'אימות והמשך',
    loginVerifying: 'מאמת',
    loginChangeNumber: 'שינוי מספר',
    loginResendIn: 'שליחה חוזרת בעוד {seconds} שנ׳',
    loginResend: 'שליחת קוד מחדש',
    loginSecureNote: 'חיבור מוצפן · גישה למנהלי מעבדה בלבד',
    loginStepStatus: 'שלב {current} מתוך {total}',
    loginErrorCredentials: 'מספר הטלפון והסיסמה אינם תואמים.',
    loginErrorCode: 'קוד שגוי. קוד ההדגמה הוא {code}.',
    loginErrorExpired: 'פג תוקף החיבור. יש להתחבר מחדש.',

    navHome: 'בית',
    navDashboard: 'לוח בקרה',
    navOrders: 'הזמנות',
    navInbox: 'הודעות',
    navFiles: 'קבצים',
    navAnalytics: 'אנליטיקה',
    navFinancials: 'כספים',
    navCourier: 'שליחויות',
    navTeam: 'צוות והרשאות',

    drawerWorkspace: 'סביבת עבודה',
    drawerComingSoon: 'בקרוב',
    drawerSoonBadge: 'בקרוב',
    drawerOpenMenu: 'פתיחת התפריט',
    drawerCloseMenu: 'סגירת התפריט',
    drawerOpenProfile: 'פתיחת הפרופיל',
    drawerLanguage: 'שפה',
    drawerAppearance: 'מראה',
    drawerStatusOk: 'כל המערכות תקינות',
    drawerLogout: 'התנתקות',
    themeAuto: 'אוטומטי',
    themeLight: 'בהיר',
    themeDark: 'כהה',

    dashGreetingMorning: 'בוקר טוב',
    dashGreetingAfternoon: 'צהריים טובים',
    dashGreetingEvening: 'ערב טוב',
    dashTodayAtLab: 'היום במעבדה',
    dashCasesInProduction: 'תיקים בייצור',
    dashOnTime: 'בזמן',
    dashRushJobs: '{count} עבודות דחופות',
    dashPickups: '{count} איסופים',
    dashNotifications: 'התראות',
    dashProfile: 'הפרופיל שלך',
    dashAttentionOne: 'תיק אחד דורש טיפול',
    dashAttentionMany: '{count} תיקים דורשים טיפול',
    dashAttentionAria: 'מעבר לתיקים שדורשים טיפול',
    dashStatActive: 'תיקים פעילים',
    dashStatActiveDelta: '+{count} היום',
    dashStatDue: 'ליעד השבוע',
    dashStatDueDelta: '{count} דחופים',
    dashStatDelivered: 'נמסרו',
    dashStatDeliveredDelta: '+{percent}%',
    dashStatOutstanding: 'יתרה לגבייה',
    dashStatOutstandingDelta: '{count} חשבוניות',
    dashPipeline: 'תהליך הייצור',
    dashInProgress: 'בעבודה',
    dashRecentActivity: 'פעילות אחרונה',
    dashSeeAll: 'הצגת הכול',
    quickNewCase: 'תיק חדש',
    quickCourier: 'שליח',
    quickScan: 'סריקה',
    quickInvoice: 'חשבונית',

    stageReceived: 'התקבל',
    stageDesign: 'עיצוב',
    stageProduction: 'בייצור',
    stageQuality: 'בקרת איכות',
    stageCourier: 'בדרך למסירה',
    stageDelivered: 'נמסר',
    stageShortDesign: 'עיצוב',
    stageShortProduction: 'ייצור',
    stageShortQuality: 'איכות',
    stageShortCourier: 'משלוח',

    ordersTitle: 'הזמנות',
    ordersSubtitle: '{shown} מתוך {total} תיקים',
    ordersSearch: 'חיפוש מטופל, תיק או מרפאה',
    ordersClearSearch: 'ניקוי החיפוש',
    ordersFilterSort: 'סינון ומיון',
    ordersFilterAll: 'הכול',
    ordersFilterRush: 'דחוף',
    ordersFilterStarred: 'מסומנים',
    ordersRushBadge: 'דחוף',
    ordersShade: 'גוון {shade}',
    ordersCaseAria: 'תיק {id} של {patient}',
    ordersStar: 'הוספה למסומנים',
    ordersUnstar: 'הסרה מהמסומנים',
    ordersEmptyTitle: 'לא נמצאו תיקים',
    ordersEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון הפעיל.',

    inboxTitle: 'הודעות',
    inboxUnreadSubtitle: '{count} שיחות שלא נקראו',
    inboxAllRead: 'אין הודעות חדשות',
    inboxNewMessage: 'הודעה חדשה',
    inboxFilterAll: 'הכול',
    inboxFilterUnread: 'לא נקראו',
    inboxFilterPriority: 'עדיפות',
    inboxSupport: 'תמיכת המעבדה',
    inboxSupportReply: 'מענה בדרך כלל תוך פחות מ-10 דקות',
    inboxSupportAria: 'פתיחת צ׳אט תמיכה',
    inboxActionRequired: 'נדרשת פעולה',
    inboxHighPriority: 'עדיפות גבוהה',
    inboxConversationAria: 'שיחה עם {name}',
    inboxEmptyTitle: 'אין כאן כלום',
    inboxEmptyBody: 'אין שיחות שתואמות את הסינון.',

    filesTitle: 'קבצים',
    filesSubtitle: 'סריקות, תמונות ומסמכים',
    filesUpload: 'העלאת קובץ',
    filesStorage: 'אחסון המעבדה',
    filesStorageUsed: '{used} מתוך {total} בשימוש',
    filesFolders: 'תיקיות',
    filesManage: 'ניהול',
    filesRecent: 'העלאות אחרונות',
    filesSeeAll: 'הצגת הכול',
    filesCount: '{count} קבצים',
    filesFolderAria: '{name}, {count} קבצים',
    filesMore: 'אפשרויות נוספות',
  },

  ar: {
    loginTagline: 'ترميمات دقيقة، من الطبعة حتى التسليم.',
    loginWelcome: 'أهلًا بعودتك',
    loginSubtitle: 'سجّل الدخول إلى مساحة عمل المختبر.',
    loginPhoneLabel: 'رقم الهاتف',
    loginPhonePlaceholder: 'أدخل رقم هاتفك',
    loginPasswordLabel: 'كلمة المرور',
    loginPasswordPlaceholder: 'أدخل كلمة المرور',
    loginShowPassword: 'إظهار كلمة المرور',
    loginHidePassword: 'إخفاء كلمة المرور',
    loginSendCode: 'إرسال رمز التحقق',
    loginFillDemo: 'تعبئة بيانات العرض',
    loginVerifyTitle: 'تأكيد هويتك',
    loginVerifySubtitle: 'أدخل الرمز المكوّن من {count} أرقام المُرسل إلى هاتفك.',
    loginDemoCode: 'رمز العرض هو {code}',
    loginVerifyAction: 'تحقق ومتابعة',
    loginVerifying: 'جارٍ التحقق',
    loginChangeNumber: 'تغيير الرقم',
    loginResendIn: 'إعادة الإرسال خلال {seconds} ث',
    loginResend: 'إعادة إرسال الرمز',
    loginSecureNote: 'جلسة مشفّرة · لمشرفي المختبر فقط',
    loginStepStatus: 'الخطوة {current} من {total}',
    loginErrorCredentials: 'رقم الهاتف وكلمة المرور غير متطابقين.',
    loginErrorCode: 'رمز غير صحيح. رمز العرض هو {code}.',
    loginErrorExpired: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجددًا.',

    navHome: 'الرئيسية',
    navDashboard: 'لوحة التحكم',
    navOrders: 'الطلبات',
    navInbox: 'الرسائل',
    navFiles: 'الملفات',
    navAnalytics: 'التحليلات',
    navFinancials: 'المالية',
    navCourier: 'التوصيل',
    navTeam: 'الفريق والصلاحيات',

    drawerWorkspace: 'مساحة العمل',
    drawerComingSoon: 'قريبًا',
    drawerSoonBadge: 'قريبًا',
    drawerOpenMenu: 'فتح القائمة',
    drawerCloseMenu: 'إغلاق القائمة',
    drawerOpenProfile: 'فتح الملف الشخصي',
    drawerLanguage: 'اللغة',
    drawerAppearance: 'المظهر',
    drawerStatusOk: 'جميع الأنظمة تعمل بشكل سليم',
    drawerLogout: 'تسجيل الخروج',
    themeAuto: 'تلقائي',
    themeLight: 'فاتح',
    themeDark: 'داكن',

    dashGreetingMorning: 'صباح الخير',
    dashGreetingAfternoon: 'نهارك سعيد',
    dashGreetingEvening: 'مساء الخير',
    dashTodayAtLab: 'اليوم في المختبر',
    dashCasesInProduction: 'حالة قيد الإنتاج',
    dashOnTime: 'في الموعد',
    dashRushJobs: '{count} أعمال مستعجلة',
    dashPickups: '{count} عمليات استلام',
    dashNotifications: 'الإشعارات',
    dashProfile: 'ملفك الشخصي',
    dashAttentionOne: 'حالة واحدة تحتاج إلى متابعة',
    dashAttentionMany: '{count} حالات تحتاج إلى متابعة',
    dashAttentionAria: 'مراجعة الحالات التي تحتاج إلى متابعة',
    dashStatActive: 'حالات نشطة',
    dashStatActiveDelta: '+{count} اليوم',
    dashStatDue: 'مستحقة هذا الأسبوع',
    dashStatDueDelta: '{count} عاجلة',
    dashStatDelivered: 'تم التسليم',
    dashStatDeliveredDelta: '+{percent}%',
    dashStatOutstanding: 'مستحقات',
    dashStatOutstandingDelta: '{count} فواتير',
    dashPipeline: 'مسار الإنتاج',
    dashInProgress: 'قيد التنفيذ',
    dashRecentActivity: 'النشاط الأخير',
    dashSeeAll: 'عرض الكل',
    quickNewCase: 'حالة جديدة',
    quickCourier: 'مندوب',
    quickScan: 'ملف مسح',
    quickInvoice: 'فاتورة',

    stageReceived: 'تم الاستلام',
    stageDesign: 'التصميم',
    stageProduction: 'قيد الإنتاج',
    stageQuality: 'فحص الجودة',
    stageCourier: 'في طريق التوصيل',
    stageDelivered: 'تم التسليم',
    stageShortDesign: 'تصميم',
    stageShortProduction: 'إنتاج',
    stageShortQuality: 'جودة',
    stageShortCourier: 'توصيل',

    ordersTitle: 'الطلبات',
    ordersSubtitle: '{shown} من {total} حالة',
    ordersSearch: 'ابحث عن مريض أو حالة أو عيادة',
    ordersClearSearch: 'مسح البحث',
    ordersFilterSort: 'تصفية وترتيب',
    ordersFilterAll: 'الكل',
    ordersFilterRush: 'مستعجل',
    ordersFilterStarred: 'المميّزة',
    ordersRushBadge: 'مستعجل',
    ordersShade: 'درجة {shade}',
    ordersCaseAria: 'الحالة {id} للمريض {patient}',
    ordersStar: 'إضافة إلى المميّزة',
    ordersUnstar: 'إزالة من المميّزة',
    ordersEmptyTitle: 'لا توجد حالات',
    ordersEmptyBody: 'جرّب كلمة بحث أخرى أو امسح عامل التصفية.',

    inboxTitle: 'الرسائل',
    inboxUnreadSubtitle: '{count} محادثات غير مقروءة',
    inboxAllRead: 'لا توجد رسائل جديدة',
    inboxNewMessage: 'رسالة جديدة',
    inboxFilterAll: 'الكل',
    inboxFilterUnread: 'غير مقروءة',
    inboxFilterPriority: 'أولوية',
    inboxSupport: 'دعم المختبر',
    inboxSupportReply: 'الرد عادةً خلال أقل من 10 دقائق',
    inboxSupportAria: 'فتح محادثة الدعم',
    inboxActionRequired: 'مطلوب إجراء',
    inboxHighPriority: 'أولوية عالية',
    inboxConversationAria: 'محادثة مع {name}',
    inboxEmptyTitle: 'لا يوجد شيء هنا',
    inboxEmptyBody: 'لا توجد محادثات تطابق هذه التصفية.',

    filesTitle: 'الملفات',
    filesSubtitle: 'مسوحات وصور ومستندات',
    filesUpload: 'رفع ملف',
    filesStorage: 'تخزين المختبر',
    filesStorageUsed: '{used} من {total} مستخدمة',
    filesFolders: 'المجلدات',
    filesManage: 'إدارة',
    filesRecent: 'أحدث الملفات',
    filesSeeAll: 'عرض الكل',
    filesCount: '{count} ملفات',
    filesFolderAria: '{name}، {count} ملفات',
    filesMore: 'خيارات أخرى',
  },
};
