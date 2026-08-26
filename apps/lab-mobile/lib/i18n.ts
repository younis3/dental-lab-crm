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
  loginWelcome: string;
  loginSubtitle: string;
  loginPhoneLabel: string;
  loginPhonePlaceholder: string;
  loginPasswordLabel: string;
  loginPasswordPlaceholder: string;
  loginShowPassword: string;
  loginHidePassword: string;
  loginSendCode: string;
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
  navExocad: string;

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

  // exocad viewer
  exocadTitle: string;
  exocadSubtitle: string;
  exocadAboutTitle: string;
  exocadAboutBody: string;
  exocadChooseTitle: string;
  exocadFileCount: string;
  exocadOpenAria: string;
  exocadEmptyTitle: string;
  exocadEmptyBody: string;
  exocadLoading: string;
  exocadLoadingHint: string;
  exocadErrorTitle: string;
  exocadErrorBody: string;
  exocadRetry: string;
  exocadReload: string;
  exocadBack: string;
  exocadBackToList: string;
  exocadNotFoundTitle: string;
  exocadNotFoundBody: string;

  // shared actions
  actionBack: string;
  actionClose: string;
  actionSave: string;
  actionCancel: string;
  actionEdit: string;
  actionDelete: string;
  filterAll: string;
  searchClear: string;
  accessDeniedTitle: string;
  accessDeniedBody: string;

  // relative time
  timeJustNow: string;
  timeMinutes: string;
  timeHours: string;
  timeDays: string;

  // roles
  roleLabOwner: string;
  roleLabStaff: string;
  roleDoctor: string;
  roleDriver: string;
  loginDemoRoles: string;

  // permissions
  permViewDashboard: string;
  permViewOrders: string;
  permEditOrders: string;
  permViewInbox: string;
  permViewFiles: string;
  permViewDoctors: string;
  permViewClinics: string;
  permViewPatients: string;
  permViewDeliveries: string;
  permViewExocad: string;
  permManageStaff: string;

  // navigation added with the directory and team screens
  navNotifications: string;
  navDoctors: string;
  navClinics: string;
  navPatients: string;
  navDeliveries: string;
  navMyCases: string;
  drawerDirectory: string;
  drawerManage: string;

  // notifications
  notificationsUnread: string;
  notificationsAllRead: string;
  notificationsMarkAll: string;
  notificationsSettings: string;
  notificationsSettingsHint: string;
  notificationsEmptyTitle: string;
  notificationsEmptyBody: string;
  notificationsOpenAria: string;
  notifTypeNewCase: string;
  notifTypeNewCaseHint: string;
  notifTypeDueSoon: string;
  notifTypeDueSoonHint: string;
  notifTypeMessage: string;
  notifTypeMessageHint: string;
  notifTypeDelivery: string;
  notifTypeDeliveryHint: string;
  notifTypeInvoice: string;
  notifTypeInvoiceHint: string;

  // data table
  tableRange: string;
  tableRangeEmpty: string;
  tablePageOf: string;
  tablePrevious: string;
  tableNext: string;
  tableSortBy: string;

  // directory status
  statusActive: string;
  statusPending: string;
  statusInactive: string;

  // directory columns
  colDoctor: string;
  colClinic: string;
  colSpecialty: string;
  colPhone: string;
  colActiveCases: string;
  colTotalCases: string;
  colStatus: string;
  colCity: string;
  colDoctorsCount: string;
  colOutstanding: string;
  colPatient: string;
  colCase: string;
  colWorkType: string;
  colAge: string;
  colStage: string;

  // doctors
  doctorsTitle: string;
  doctorsSubtitle: string;
  doctorsSearch: string;
  doctorsEmptyTitle: string;
  doctorsEmptyBody: string;

  // clinics
  clinicsTitle: string;
  clinicsSubtitle: string;
  clinicsSearch: string;
  clinicsEmptyTitle: string;
  clinicsEmptyBody: string;

  // patients
  patientsTitle: string;
  patientsSubtitle: string;
  patientsSearch: string;
  patientsEmptyTitle: string;
  patientsEmptyBody: string;

  // team and roles
  staffTitle: string;
  staffSubtitle: string;
  staffAdd: string;
  staffEmptyTitle: string;
  staffEmptyBody: string;
  staffOwnerBadge: string;
  staffOwnerProtected: string;
  staffInactiveBadge: string;
  staffPermissionsCount: string;
  staffMemberAria: string;
  staffFormNewTitle: string;
  staffFormEditTitle: string;
  staffFormName: string;
  staffFormNamePlaceholder: string;
  staffFormJobTitle: string;
  staffFormJobTitlePlaceholder: string;
  staffFormPhone: string;
  staffFormPhonePlaceholder: string;
  staffFormEmail: string;
  staffFormEmailPlaceholder: string;
  staffFormRoleTitle: string;
  staffFormRoleHint: string;
  staffFormRoleLocked: string;
  staffFormAccessTitle: string;
  staffFormAccessHint: string;
  staffFormStatusTitle: string;
  staffFormStatusHint: string;
  staffFormColorTitle: string;
  staffFormColorAria: string;
  staffFormNameRequired: string;
  staffDeleteTitle: string;
  staffDeleteBody: string;
};

export const UI_STRINGS: Record<Lang, UiStrings> = {
  en: {
    loginWelcome: 'Welcome back',
    loginSubtitle: 'Sign in to your lab workspace.',
    loginPhoneLabel: 'Phone number',
    loginPhonePlaceholder: 'Enter your phone number',
    loginPasswordLabel: 'Password',
    loginPasswordPlaceholder: 'Enter your password',
    loginShowPassword: 'Show password',
    loginHidePassword: 'Hide password',
    loginSendCode: 'Send verification code',
    loginVerifyTitle: 'Verify it’s you',
    loginVerifySubtitle: 'Enter the {count}-digit code sent to your phone.',
    loginDemoCode: 'Demo code is {code}',
    loginVerifyAction: 'Verify and continue',
    loginVerifying: 'Verifying',
    loginChangeNumber: 'Change number',
    loginResendIn: 'Resend in {seconds}s',
    loginResend: 'Resend code',
    loginSecureNote: 'Encrypted session · Nadeem Dental Lab',
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
    navExocad: 'exocad demo',

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

    exocadTitle: 'exocad demo',
    exocadSubtitle: 'Open a 3D case in the exocad webview',
    exocadAboutTitle: 'How it works',
    exocadAboutBody:
      'Every export already contains the STL meshes and the exocad viewer, so a case opens without an internet connection.',
    exocadChooseTitle: 'Choose a file',
    exocadFileCount: '{count} files bundled with the app',
    exocadOpenAria: 'Open {name} in the 3D viewer',
    exocadEmptyTitle: 'No exocad files yet',
    exocadEmptyBody: 'Add an exported HTML file to assets/exocad and register it in lib/exocad.ts.',
    exocadLoading: 'Loading the 3D viewer',
    exocadLoadingHint: 'Large cases can take a few seconds.',
    exocadErrorTitle: 'Could not open the file',
    exocadErrorBody: 'The exocad export did not load. Check the file and try again.',
    exocadRetry: 'Try again',
    exocadReload: 'Reload viewer',
    exocadBack: 'Back',
    exocadBackToList: 'Back to files',
    exocadNotFoundTitle: 'File not found',
    exocadNotFoundBody: 'This exocad file is no longer bundled with the app.',

    actionBack: 'Back',
    actionClose: 'Close',
    actionSave: 'Save',
    actionCancel: 'Cancel',
    actionEdit: 'Edit',
    actionDelete: 'Delete',
    filterAll: 'All',
    searchClear: 'Clear search',
    accessDeniedTitle: 'No access',
    accessDeniedBody: 'Ask the lab owner to grant you this permission.',

    timeJustNow: 'Just now',
    timeMinutes: '{count}m ago',
    timeHours: '{count}h ago',
    timeDays: '{count}d ago',

    roleLabOwner: 'Lab owner',
    roleLabStaff: 'Lab technician',
    roleDoctor: 'Doctor',
    roleDriver: 'Courier',
    loginDemoRoles: 'Sign in as',

    permViewDashboard: 'View dashboard',
    permViewOrders: 'View orders',
    permEditOrders: 'Edit orders',
    permViewInbox: 'View inbox',
    permViewFiles: 'View files',
    permViewDoctors: 'View doctors',
    permViewClinics: 'View clinics',
    permViewPatients: 'View patients',
    permViewDeliveries: 'View deliveries',
    permViewExocad: 'Open exocad viewer',
    permManageStaff: 'Manage team',

    navNotifications: 'Notifications',
    navDoctors: 'Doctors',
    navClinics: 'Clinics',
    navPatients: 'Patients',
    navDeliveries: 'Deliveries',
    navMyCases: 'My cases',
    drawerDirectory: 'Directory',
    drawerManage: 'Management',

    notificationsUnread: '{count} unread',
    notificationsAllRead: 'You are all caught up',
    notificationsMarkAll: 'Mark all as read',
    notificationsSettings: 'Notification settings',
    notificationsSettingsHint: 'Choose which updates reach this device.',
    notificationsEmptyTitle: 'No notifications',
    notificationsEmptyBody: 'Turn a category back on in settings to see its history.',
    notificationsOpenAria: 'Open notifications',
    notifTypeNewCase: 'New case',
    notifTypeNewCaseHint: 'A clinic sent a new prescription',
    notifTypeDueSoon: 'Deadline',
    notifTypeDueSoonHint: 'A case is close to its due date',
    notifTypeMessage: 'Message',
    notifTypeMessageHint: 'A doctor replied in the inbox',
    notifTypeDelivery: 'Delivery',
    notifTypeDeliveryHint: 'Pickup and drop-off updates',
    notifTypeInvoice: 'Billing',
    notifTypeInvoiceHint: 'Invoice and payment alerts',

    tableRange: '{from}–{to} of {total}',
    tableRangeEmpty: 'No results',
    tablePageOf: '{page} / {total}',
    tablePrevious: 'Previous page',
    tableNext: 'Next page',
    tableSortBy: 'Sort by {column}',

    statusActive: 'Active',
    statusPending: 'Pending',
    statusInactive: 'Inactive',

    colDoctor: 'Doctor',
    colClinic: 'Clinic',
    colSpecialty: 'Specialty',
    colPhone: 'Phone',
    colActiveCases: 'Active',
    colTotalCases: 'Total',
    colStatus: 'Status',
    colCity: 'City',
    colDoctorsCount: 'Doctors',
    colOutstanding: 'Balance',
    colPatient: 'Patient',
    colCase: 'Case',
    colWorkType: 'Work type',
    colAge: 'Age',
    colStage: 'Stage',

    doctorsTitle: 'Doctors',
    doctorsSubtitle: '{count} referring doctors',
    doctorsSearch: 'Search doctor, clinic or specialty',
    doctorsEmptyTitle: 'No doctors found',
    doctorsEmptyBody: 'Try a different search term or clear the filter.',

    clinicsTitle: 'Clinics',
    clinicsSubtitle: '{count} partner clinics',
    clinicsSearch: 'Search clinic or city',
    clinicsEmptyTitle: 'No clinics found',
    clinicsEmptyBody: 'Try a different search term or clear the filter.',

    patientsTitle: 'Patients',
    patientsSubtitle: '{count} patients on file',
    patientsSearch: 'Search patient, case or doctor',
    patientsEmptyTitle: 'No patients found',
    patientsEmptyBody: 'Try a different search term or clear the filter.',

    staffTitle: 'Team & roles',
    staffSubtitle: '{count} team members',
    staffAdd: 'Add member',
    staffEmptyTitle: 'No team members',
    staffEmptyBody: 'Add your first lab worker to assign access.',
    staffOwnerBadge: 'Owner',
    staffOwnerProtected: 'The owner seat always keeps full access.',
    staffInactiveBadge: 'Suspended',
    staffPermissionsCount: '{count} of {total} permissions',
    staffMemberAria: 'Edit {name}',
    staffFormNewTitle: 'New team member',
    staffFormEditTitle: 'Edit team member',
    staffFormName: 'Full name',
    staffFormNamePlaceholder: 'e.g. Karim Haddad',
    staffFormJobTitle: 'Job title',
    staffFormJobTitlePlaceholder: 'e.g. Ceramist',
    staffFormPhone: 'Phone number',
    staffFormPhonePlaceholder: 'Number used to sign in',
    staffFormEmail: 'Email',
    staffFormEmailPlaceholder: 'name@nadeemlab.com',
    staffFormRoleTitle: 'Role',
    staffFormRoleHint: 'The role sets the starting permissions.',
    staffFormRoleLocked: 'The owner role cannot be changed.',
    staffFormAccessTitle: 'Access',
    staffFormAccessHint: 'Turn single permissions on or off for this member.',
    staffFormStatusTitle: 'Account status',
    staffFormStatusHint: 'A suspended member cannot sign in.',
    staffFormColorTitle: 'Roster colour',
    staffFormColorAria: 'Use colour {index}',
    staffFormNameRequired: 'Enter a name before saving.',
    staffDeleteTitle: 'Remove member',
    staffDeleteBody: '{name} will lose access to the lab workspace.',
  },

  he: {
    loginWelcome: 'ברוך שובך',
    loginSubtitle: 'התחברו לסביבת העבודה של המעבדה.',
    loginPhoneLabel: 'מספר טלפון',
    loginPhonePlaceholder: 'הזינו מספר טלפון',
    loginPasswordLabel: 'סיסמה',
    loginPasswordPlaceholder: 'הזינו סיסמה',
    loginShowPassword: 'הצגת הסיסמה',
    loginHidePassword: 'הסתרת הסיסמה',
    loginSendCode: 'שליחת קוד אימות',
    loginVerifyTitle: 'אימות זהות',
    loginVerifySubtitle: 'הזינו את הקוד בן {count} הספרות שנשלח לטלפון שלכם.',
    loginDemoCode: 'קוד ההדגמה הוא {code}',
    loginVerifyAction: 'אימות והמשך',
    loginVerifying: 'מאמת',
    loginChangeNumber: 'שינוי מספר',
    loginResendIn: 'שליחה חוזרת בעוד {seconds} שנ׳',
    loginResend: 'שליחת קוד מחדש',
    loginSecureNote: 'חיבור מוצפן · Nadeem Dental Lab',
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
    navExocad: 'הדגמת exocad',

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

    exocadTitle: 'הדגמת exocad',
    exocadSubtitle: 'פתיחת תיק תלת-ממד במציג exocad webview',
    exocadAboutTitle: 'איך זה עובד',
    exocadAboutBody:
      'כל קובץ יצוא כולל בתוכו את קבצי ה-STL ואת מציג exocad, ולכן התיק נפתח גם בלי חיבור לאינטרנט.',
    exocadChooseTitle: 'בחירת קובץ',
    exocadFileCount: '{count} קבצים מצורפים לאפליקציה',
    exocadOpenAria: 'פתיחת {name} במציג התלת-ממד',
    exocadEmptyTitle: 'אין עדיין קבצי exocad',
    exocadEmptyBody: 'הוסיפו קובץ HTML מיוצא לתיקייה assets/exocad ורשמו אותו בקובץ lib/exocad.ts.',
    exocadLoading: 'טוען את מציג התלת-ממד',
    exocadLoadingHint: 'תיקים גדולים עשויים להימשך כמה שניות.',
    exocadErrorTitle: 'לא ניתן לפתוח את הקובץ',
    exocadErrorBody: 'קובץ ה-exocad לא נטען. בדקו את הקובץ ונסו שוב.',
    exocadRetry: 'נסו שוב',
    exocadReload: 'טעינת המציג מחדש',
    exocadBack: 'חזרה',
    exocadBackToList: 'חזרה לרשימת הקבצים',
    exocadNotFoundTitle: 'הקובץ לא נמצא',
    exocadNotFoundBody: 'הקובץ הזה אינו מצורף יותר לאפליקציה.',

    actionBack: 'חזרה',
    actionClose: 'סגירה',
    actionSave: 'שמירה',
    actionCancel: 'ביטול',
    actionEdit: 'עריכה',
    actionDelete: 'מחיקה',
    filterAll: 'הכול',
    searchClear: 'ניקוי החיפוש',
    accessDeniedTitle: 'אין גישה',
    accessDeniedBody: 'בקשו מבעל המעבדה להעניק לכם את ההרשאה הזו.',

    timeJustNow: 'עכשיו',
    timeMinutes: 'לפני {count} דק׳',
    timeHours: 'לפני {count} שע׳',
    timeDays: 'לפני {count} ימים',

    roleLabOwner: 'בעל המעבדה',
    roleLabStaff: 'טכנאי מעבדה',
    roleDoctor: 'רופא',
    roleDriver: 'שליח',
    loginDemoRoles: 'התחברות בתור',

    permViewDashboard: 'צפייה בלוח הבקרה',
    permViewOrders: 'צפייה בהזמנות',
    permEditOrders: 'עריכת הזמנות',
    permViewInbox: 'צפייה בהודעות',
    permViewFiles: 'צפייה בקבצים',
    permViewDoctors: 'צפייה ברופאים',
    permViewClinics: 'צפייה במרפאות',
    permViewPatients: 'צפייה במטופלים',
    permViewDeliveries: 'צפייה במשלוחים',
    permViewExocad: 'פתיחת מציג exocad',
    permManageStaff: 'ניהול הצוות',

    navNotifications: 'התראות',
    navDoctors: 'רופאים',
    navClinics: 'מרפאות',
    navPatients: 'מטופלים',
    navDeliveries: 'משלוחים',
    navMyCases: 'התיקים שלי',
    drawerDirectory: 'ספריית לקוחות',
    drawerManage: 'ניהול',

    notificationsUnread: '{count} שלא נקראו',
    notificationsAllRead: 'אין התראות חדשות',
    notificationsMarkAll: 'סימון הכול כנקרא',
    notificationsSettings: 'הגדרות התראות',
    notificationsSettingsHint: 'בחרו אילו עדכונים יגיעו למכשיר הזה.',
    notificationsEmptyTitle: 'אין התראות',
    notificationsEmptyBody: 'הפעילו קטגוריה מחדש בהגדרות כדי לראות את ההיסטוריה שלה.',
    notificationsOpenAria: 'פתיחת ההתראות',
    notifTypeNewCase: 'תיק חדש',
    notifTypeNewCaseHint: 'מרפאה שלחה הזמנת עבודה חדשה',
    notifTypeDueSoon: 'מועד יעד',
    notifTypeDueSoonHint: 'תיק מתקרב למועד היעד שלו',
    notifTypeMessage: 'הודעה',
    notifTypeMessageHint: 'רופא השיב בתיבת ההודעות',
    notifTypeDelivery: 'משלוח',
    notifTypeDeliveryHint: 'עדכוני איסוף ומסירה',
    notifTypeInvoice: 'חיובים',
    notifTypeInvoiceHint: 'התראות על חשבוניות ותשלומים',

    tableRange: '{from}–{to} מתוך {total}',
    tableRangeEmpty: 'אין תוצאות',
    tablePageOf: '{page} / {total}',
    tablePrevious: 'העמוד הקודם',
    tableNext: 'העמוד הבא',
    tableSortBy: 'מיון לפי {column}',

    statusActive: 'פעיל',
    statusPending: 'ממתין',
    statusInactive: 'לא פעיל',

    colDoctor: 'רופא',
    colClinic: 'מרפאה',
    colSpecialty: 'התמחות',
    colPhone: 'טלפון',
    colActiveCases: 'פעילים',
    colTotalCases: 'סה״כ',
    colStatus: 'סטטוס',
    colCity: 'עיר',
    colDoctorsCount: 'רופאים',
    colOutstanding: 'יתרה',
    colPatient: 'מטופל',
    colCase: 'תיק',
    colWorkType: 'סוג עבודה',
    colAge: 'גיל',
    colStage: 'שלב',

    doctorsTitle: 'רופאים',
    doctorsSubtitle: '{count} רופאים מפנים',
    doctorsSearch: 'חיפוש רופא, מרפאה או התמחות',
    doctorsEmptyTitle: 'לא נמצאו רופאים',
    doctorsEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',

    clinicsTitle: 'מרפאות',
    clinicsSubtitle: '{count} מרפאות שותפות',
    clinicsSearch: 'חיפוש מרפאה או עיר',
    clinicsEmptyTitle: 'לא נמצאו מרפאות',
    clinicsEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',

    patientsTitle: 'מטופלים',
    patientsSubtitle: '{count} מטופלים בתיקייה',
    patientsSearch: 'חיפוש מטופל, תיק או רופא',
    patientsEmptyTitle: 'לא נמצאו מטופלים',
    patientsEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',

    staffTitle: 'צוות והרשאות',
    staffSubtitle: '{count} חברי צוות',
    staffAdd: 'הוספת חבר צוות',
    staffEmptyTitle: 'אין חברי צוות',
    staffEmptyBody: 'הוסיפו עובד מעבדה ראשון כדי להגדיר הרשאות.',
    staffOwnerBadge: 'בעלים',
    staffOwnerProtected: 'מושב הבעלים שומר תמיד על גישה מלאה.',
    staffInactiveBadge: 'מושהה',
    staffPermissionsCount: '{count} מתוך {total} הרשאות',
    staffMemberAria: 'עריכת {name}',
    staffFormNewTitle: 'חבר צוות חדש',
    staffFormEditTitle: 'עריכת חבר צוות',
    staffFormName: 'שם מלא',
    staffFormNamePlaceholder: 'לדוגמה: כרים חדאד',
    staffFormJobTitle: 'תפקיד',
    staffFormJobTitlePlaceholder: 'לדוגמה: קרמיסט',
    staffFormPhone: 'מספר טלפון',
    staffFormPhonePlaceholder: 'המספר שמשמש להתחברות',
    staffFormEmail: 'דוא״ל',
    staffFormEmailPlaceholder: 'name@nadeemlab.com',
    staffFormRoleTitle: 'תפקיד במערכת',
    staffFormRoleHint: 'התפקיד קובע את ההרשאות ההתחלתיות.',
    staffFormRoleLocked: 'לא ניתן לשנות את תפקיד הבעלים.',
    staffFormAccessTitle: 'הרשאות',
    staffFormAccessHint: 'הפעילו או כבו הרשאות בודדות עבור חבר הצוות הזה.',
    staffFormStatusTitle: 'סטטוס החשבון',
    staffFormStatusHint: 'חבר צוות מושהה אינו יכול להתחבר.',
    staffFormColorTitle: 'צבע ברשימת הצוות',
    staffFormColorAria: 'בחירת צבע {index}',
    staffFormNameRequired: 'יש להזין שם לפני השמירה.',
    staffDeleteTitle: 'הסרת חבר צוות',
    staffDeleteBody: '{name} יאבד את הגישה לסביבת העבודה של המעבדה.',
  },

  ar: {
    loginWelcome: 'أهلًا بعودتك',
    loginSubtitle: 'سجّل الدخول إلى مساحة عمل المختبر.',
    loginPhoneLabel: 'رقم الهاتف',
    loginPhonePlaceholder: 'أدخل رقم هاتفك',
    loginPasswordLabel: 'كلمة المرور',
    loginPasswordPlaceholder: 'أدخل كلمة المرور',
    loginShowPassword: 'إظهار كلمة المرور',
    loginHidePassword: 'إخفاء كلمة المرور',
    loginSendCode: 'إرسال رمز التحقق',
    loginVerifyTitle: 'تأكيد هويتك',
    loginVerifySubtitle: 'أدخل الرمز المكوّن من {count} أرقام المُرسل إلى هاتفك.',
    loginDemoCode: 'رمز العرض هو {code}',
    loginVerifyAction: 'تحقق ومتابعة',
    loginVerifying: 'جارٍ التحقق',
    loginChangeNumber: 'تغيير الرقم',
    loginResendIn: 'إعادة الإرسال خلال {seconds} ث',
    loginResend: 'إعادة إرسال الرمز',
    loginSecureNote: 'جلسة مشفّرة · Nadeem Dental Lab',
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
    navExocad: 'عرض exocad',

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

    exocadTitle: 'عرض exocad',
    exocadSubtitle: 'افتح حالة ثلاثية الأبعاد في عارض exocad webview',
    exocadAboutTitle: 'كيف يعمل',
    exocadAboutBody:
      'كل ملف مُصدَّر يحتوي على شبكات STL وعلى عارض exocad، لذلك تُفتح الحالة دون اتصال بالإنترنت.',
    exocadChooseTitle: 'اختر ملفًا',
    exocadFileCount: '{count} ملفات مضمّنة في التطبيق',
    exocadOpenAria: 'افتح {name} في العارض ثلاثي الأبعاد',
    exocadEmptyTitle: 'لا توجد ملفات exocad بعد',
    exocadEmptyBody: 'أضف ملف HTML مُصدَّرًا إلى assets/exocad وسجّله في lib/exocad.ts.',
    exocadLoading: 'جارٍ تحميل العارض ثلاثي الأبعاد',
    exocadLoadingHint: 'قد تستغرق الحالات الكبيرة بضع ثوانٍ.',
    exocadErrorTitle: 'تعذّر فتح الملف',
    exocadErrorBody: 'لم يتم تحميل ملف exocad. تحقق من الملف وحاول مرة أخرى.',
    exocadRetry: 'حاول مرة أخرى',
    exocadReload: 'إعادة تحميل العارض',
    exocadBack: 'رجوع',
    exocadBackToList: 'العودة إلى الملفات',
    exocadNotFoundTitle: 'الملف غير موجود',
    exocadNotFoundBody: 'هذا الملف لم يعد مضمّنًا في التطبيق.',

    actionBack: 'رجوع',
    actionClose: 'إغلاق',
    actionSave: 'حفظ',
    actionCancel: 'إلغاء',
    actionEdit: 'تعديل',
    actionDelete: 'حذف',
    filterAll: 'الكل',
    searchClear: 'مسح البحث',
    accessDeniedTitle: 'لا توجد صلاحية',
    accessDeniedBody: 'اطلب من مالك المختبر منحك هذه الصلاحية.',

    timeJustNow: 'الآن',
    timeMinutes: 'قبل {count} د',
    timeHours: 'قبل {count} س',
    timeDays: 'قبل {count} أيام',

    roleLabOwner: 'مالك المختبر',
    roleLabStaff: 'فني مختبر',
    roleDoctor: 'طبيب',
    roleDriver: 'مندوب توصيل',
    loginDemoRoles: 'تسجيل الدخول كـ',

    permViewDashboard: 'عرض لوحة التحكم',
    permViewOrders: 'عرض الطلبات',
    permEditOrders: 'تعديل الطلبات',
    permViewInbox: 'عرض الرسائل',
    permViewFiles: 'عرض الملفات',
    permViewDoctors: 'عرض الأطباء',
    permViewClinics: 'عرض العيادات',
    permViewPatients: 'عرض المرضى',
    permViewDeliveries: 'عرض عمليات التوصيل',
    permViewExocad: 'فتح عارض exocad',
    permManageStaff: 'إدارة الفريق',

    navNotifications: 'الإشعارات',
    navDoctors: 'الأطباء',
    navClinics: 'العيادات',
    navPatients: 'المرضى',
    navDeliveries: 'التوصيلات',
    navMyCases: 'حالاتي',
    drawerDirectory: 'دليل العملاء',
    drawerManage: 'الإدارة',

    notificationsUnread: '{count} غير مقروءة',
    notificationsAllRead: 'لا توجد إشعارات جديدة',
    notificationsMarkAll: 'تعليم الكل كمقروء',
    notificationsSettings: 'إعدادات الإشعارات',
    notificationsSettingsHint: 'اختر التحديثات التي تصل إلى هذا الجهاز.',
    notificationsEmptyTitle: 'لا توجد إشعارات',
    notificationsEmptyBody: 'أعد تفعيل فئة من الإعدادات لعرض سجلها.',
    notificationsOpenAria: 'فتح الإشعارات',
    notifTypeNewCase: 'حالة جديدة',
    notifTypeNewCaseHint: 'أرسلت عيادة أمر عمل جديد',
    notifTypeDueSoon: 'موعد التسليم',
    notifTypeDueSoonHint: 'حالة تقترب من موعد استحقاقها',
    notifTypeMessage: 'رسالة',
    notifTypeMessageHint: 'رد طبيب في صندوق الرسائل',
    notifTypeDelivery: 'التوصيل',
    notifTypeDeliveryHint: 'تحديثات الاستلام والتسليم',
    notifTypeInvoice: 'الفواتير',
    notifTypeInvoiceHint: 'تنبيهات الفواتير والمدفوعات',

    tableRange: '{from}–{to} من {total}',
    tableRangeEmpty: 'لا نتائج',
    tablePageOf: '{page} / {total}',
    tablePrevious: 'الصفحة السابقة',
    tableNext: 'الصفحة التالية',
    tableSortBy: 'ترتيب حسب {column}',

    statusActive: 'نشط',
    statusPending: 'قيد الانتظار',
    statusInactive: 'غير نشط',

    colDoctor: 'الطبيب',
    colClinic: 'العيادة',
    colSpecialty: 'التخصص',
    colPhone: 'الهاتف',
    colActiveCases: 'نشطة',
    colTotalCases: 'الإجمالي',
    colStatus: 'الحالة',
    colCity: 'المدينة',
    colDoctorsCount: 'الأطباء',
    colOutstanding: 'الرصيد',
    colPatient: 'المريض',
    colCase: 'الحالة',
    colWorkType: 'نوع العمل',
    colAge: 'العمر',
    colStage: 'المرحلة',

    doctorsTitle: 'الأطباء',
    doctorsSubtitle: '{count} طبيبًا محوّلًا',
    doctorsSearch: 'ابحث عن طبيب أو عيادة أو تخصص',
    doctorsEmptyTitle: 'لم يتم العثور على أطباء',
    doctorsEmptyBody: 'جرّب كلمة بحث أخرى أو امسح التصفية.',

    clinicsTitle: 'العيادات',
    clinicsSubtitle: '{count} عيادة شريكة',
    clinicsSearch: 'ابحث عن عيادة أو مدينة',
    clinicsEmptyTitle: 'لم يتم العثور على عيادات',
    clinicsEmptyBody: 'جرّب كلمة بحث أخرى أو امسح التصفية.',

    patientsTitle: 'المرضى',
    patientsSubtitle: '{count} مريضًا في السجل',
    patientsSearch: 'ابحث عن مريض أو حالة أو طبيب',
    patientsEmptyTitle: 'لم يتم العثور على مرضى',
    patientsEmptyBody: 'جرّب كلمة بحث أخرى أو امسح التصفية.',

    staffTitle: 'الفريق والصلاحيات',
    staffSubtitle: '{count} أعضاء فريق',
    staffAdd: 'إضافة عضو',
    staffEmptyTitle: 'لا يوجد أعضاء فريق',
    staffEmptyBody: 'أضف أول عامل مختبر لتعيين الصلاحيات.',
    staffOwnerBadge: 'المالك',
    staffOwnerProtected: 'مقعد المالك يحتفظ دائمًا بصلاحية كاملة.',
    staffInactiveBadge: 'موقوف',
    staffPermissionsCount: '{count} من {total} صلاحيات',
    staffMemberAria: 'تعديل {name}',
    staffFormNewTitle: 'عضو فريق جديد',
    staffFormEditTitle: 'تعديل عضو الفريق',
    staffFormName: 'الاسم الكامل',
    staffFormNamePlaceholder: 'مثال: كريم حداد',
    staffFormJobTitle: 'المسمى الوظيفي',
    staffFormJobTitlePlaceholder: 'مثال: أخصائي سيراميك',
    staffFormPhone: 'رقم الهاتف',
    staffFormPhonePlaceholder: 'الرقم المستخدم لتسجيل الدخول',
    staffFormEmail: 'البريد الإلكتروني',
    staffFormEmailPlaceholder: 'name@nadeemlab.com',
    staffFormRoleTitle: 'الدور في النظام',
    staffFormRoleHint: 'يحدد الدور الصلاحيات الأولية.',
    staffFormRoleLocked: 'لا يمكن تغيير دور المالك.',
    staffFormAccessTitle: 'الصلاحيات',
    staffFormAccessHint: 'فعّل أو عطّل صلاحيات فردية لهذا العضو.',
    staffFormStatusTitle: 'حالة الحساب',
    staffFormStatusHint: 'العضو الموقوف لا يمكنه تسجيل الدخول.',
    staffFormColorTitle: 'اللون في قائمة الفريق',
    staffFormColorAria: 'اختيار اللون {index}',
    staffFormNameRequired: 'أدخل اسمًا قبل الحفظ.',
    staffDeleteTitle: 'إزالة عضو',
    staffDeleteBody: 'سيفقد {name} الوصول إلى مساحة عمل المختبر.',
  },
};
