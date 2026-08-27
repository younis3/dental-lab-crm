export type Lang = 'en' | 'he';

export const LANGS: { key: Lang; label: string; short: string }[] = [
  { key: 'en', label: 'English', short: 'EN' },
  { key: 'he', label: 'עברית', short: 'עב' },
];

export const isRtl = (lang: Lang) => lang === 'he';

export const LOCALES: Record<Lang, string> = { en: 'en-US', he: 'he-IL' };

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
  navCourier: string;
  navTeam: string;
  navExocad: string;

  // drawer
  drawerWorkspace: string;
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
  dashWorkPressure: string;
  dashWorkPressureValue: string;
  dashWorkPressureAria: string;
  dashCapacityTitle: string;
  dashCapacityHint: string;
  dashCapacityLabel: string;
  dashCapacityOpen: string;
  dashCapacityDecrease: string;
  dashCapacityIncrease: string;
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
  roleReceptionist: string;
  roleStaffManager: string;
  roleWorker: string;
  roleDoctor: string;
  roleDriver: string;
  roleLabOwnerHint: string;
  roleReceptionistHint: string;
  roleStaffManagerHint: string;
  roleWorkerHint: string;
  roleDoctorHint: string;
  roleDriverHint: string;
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
  permViewBilling: string;
  permViewAnalytics: string;
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
  colPrice: string;
  colTurnaround: string;
  colCategory: string;
  colEdit: string;

  // doctors
  doctorsTitle: string;
  doctorsSubtitle: string;
  doctorsSearch: string;
  doctorsEmptyTitle: string;
  doctorsEmptyBody: string;
  doctorsAdd: string;
  doctorsAddTitle: string;
  doctorsAddNamePlaceholder: string;
  doctorsAddClinicPlaceholder: string;

  // clinics
  clinicsTitle: string;
  clinicsSubtitle: string;
  clinicsSearch: string;
  clinicsEmptyTitle: string;
  clinicsEmptyBody: string;
  clinicsAdd: string;
  clinicsAddTitle: string;
  clinicsAddNamePlaceholder: string;

  // patients
  patientsTitle: string;
  patientsSubtitle: string;
  patientsSearch: string;
  patientsEmptyTitle: string;
  patientsEmptyBody: string;
  patientsAdd: string;
  patientsAddTitle: string;
  patientsAddNamePlaceholder: string;
  patientsAddDoctorPlaceholder: string;
  patientsAddAgePlaceholder: string;

  // work types
  navWorkTypes: string;
  permViewWorkTypes: string;
  workTypesTitle: string;
  workTypesSubtitle: string;
  workTypesSearch: string;
  workTypesEmptyTitle: string;
  workTypesEmptyBody: string;
  workTypesAdd: string;
  workTypesAddTitle: string;
  workTypesAddNamePlaceholder: string;
  workTypesAddPricePlaceholder: string;
  workTypesAddDaysPlaceholder: string;
  workTypesEditTitle: string;
  workTypesEditAria: string;
  workTypeCrown: string;
  workTypeBridge: string;
  workTypeVeneer: string;
  workTypeDenture: string;
  workTypeImplant: string;
  workTypeAppliance: string;

  // quick add sheets
  quickAddName: string;
  quickAddEmail: string;
  quickAddPhonePlaceholder: string;
  quickAddEmailPlaceholder: string;
  quickAddRequired: string;
  quickAddSave: string;

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

  // tasks
  navTasks: string;
  permManageTasks: string;
  tasksTitle: string;
  tasksSubtitle: string;
  tasksTabMine: string;
  tasksTabReview: string;
  tasksTabAll: string;
  tasksTabDone: string;
  tasksEmptyMine: string;
  tasksEmptyMineHint: string;
  tasksEmptyAll: string;
  tasksEmptyAllHint: string;
  tasksEmptyReview: string;
  tasksEmptyReviewHint: string;
  tasksEmptyDone: string;
  tasksEmptyDoneHint: string;
  tasksNew: string;
  tasksEditTask: string;
  tasksNewTask: string;
  tasksNewSubtask: string;
  tasksAddSubtask: string;
  tasksFormTitle: string;
  tasksFormTitlePlaceholder: string;
  tasksFormNotes: string;
  tasksFormNotesPlaceholder: string;
  tasksFormDueDate: string;
  tasksFormDueToday: string;
  tasksFormDueTomorrow: string;
  tasksFormDueNextWeek: string;
  tasksFormDueNone: string;
  tasksFormAssignee: string;
  tasksFormParent: string;
  tasksTitleRequired: string;
  tasksMarkDone: string;
  tasksReopen: string;
  tasksConfirm: string;
  tasksUndo: string;
  tasksDeleteTitle: string;
  tasksDeleteBody: string;
  tasksDueToday: string;
  tasksDueTomorrow: string;
  tasksOverdue: string;
  tasksSubtaskCount: string;
  tasksSubtaskDetail: string;
  tasksNoNotes: string;
  tasksOpenSubtaskAria: string;
  tasksCreatedBy: string;
  tasksReviewHint: string;
  tasksDragHandle: string;
  tasksMyTaskAria: string;

  // driver runs
  deliveriesTitle: string;
  deliveriesSubtitle: string;
  deliveriesToday: string;
  deliveriesTomorrow: string;
  deliveriesThisWeek: string;
  deliveriesAllDrivers: string;
  deliveriesStopsCount: string;
  deliveriesCasesCount: string;
  deliveriesSummaryStops: string;
  deliveriesSummaryCases: string;
  deliveriesSummaryCities: string;
  deliveriesKindDrop: string;
  deliveriesKindPickup: string;
  deliveriesRushBadge: string;
  deliveriesAddress: string;
  deliveriesStopAria: string;
  deliveriesDriverAria: string;
  deliveriesEmptyTitle: string;
  deliveriesEmptyBody: string;

  // scanner
  navScan: string;
  scanTitle: string;
  scanSubtitle: string;
  scanHint: string;
  scanPermissionTitle: string;
  scanPermissionBody: string;
  scanPermissionAction: string;
  scanPermissionBlockedTitle: string;
  scanPermissionBlockedBody: string;
  scanOpenSettings: string;
  scanUnavailableTitle: string;
  scanUnavailableBody: string;
  scanRetry: string;
  scanTorchOn: string;
  scanTorchOff: string;
  scanFlipCamera: string;
  scanResultTitle: string;
  scanResultFormat: string;
  scanResultCode: string;
  scanResultCopy: string;
  scanResultCopied: string;
  scanResultAgain: string;
  scanCameraAria: string;

  // invoicing
  navNewInvoice: string;
  navBilling: string;
  drawerMoney: string;
  invoiceNewTitle: string;
  invoiceNewSubtitle: string;
  invoiceCustomerTitle: string;
  invoiceCustomerDoctor: string;
  invoiceCustomerWalkIn: string;
  invoicePickDoctor: string;
  invoicePickDoctorHint: string;
  invoiceWalkInHint: string;
  invoiceChangeDoctor: string;
  invoiceDoctorSheetTitle: string;
  invoiceDoctorSearch: string;
  invoiceDoctorEmpty: string;
  invoiceDoctorEmptyHint: string;
  invoiceCustomerName: string;
  invoiceCustomerNamePlaceholder: string;
  invoiceEmail: string;
  invoiceEmailPlaceholder: string;
  invoicePhone: string;
  invoicePhonePlaceholder: string;
  invoiceItemsTitle: string;
  invoiceItemsHint: string;
  invoiceItemsEmpty: string;
  invoiceItemsEmptyHint: string;
  invoiceAddServiceAria: string;
  invoiceCustomLine: string;
  invoiceLineEach: string;
  invoiceLineRemove: string;
  invoiceLineIncrease: string;
  invoiceLineDecrease: string;
  invoiceLineSheetNew: string;
  invoiceLineSheetEdit: string;
  invoiceLineDescription: string;
  invoiceLineDescriptionPlaceholder: string;
  invoiceLineUnitPrice: string;
  invoiceLineQuantity: string;
  invoiceLineRequired: string;
  invoiceTermsTitle: string;
  invoiceDueOn: string;
  invoiceNotesTitle: string;
  invoiceNotesPlaceholder: string;
  invoiceSubtotal: string;
  invoiceVat: string;
  invoiceTotal: string;
  invoiceSendTitle: string;
  invoiceChannelEmail: string;
  invoiceChannelApp: string;
  invoiceChannelEmailHint: string;
  invoiceChannelAppHint: string;
  invoiceSend: string;
  invoiceSaveDraft: string;
  invoiceErrorCustomer: string;
  invoiceErrorEmail: string;
  invoiceErrorLines: string;
  invoiceSentTitle: string;
  invoiceSentBody: string;
  invoiceDraftSavedTitle: string;
  invoiceDraftSavedBody: string;
  invoiceMailFallback: string;
  invoiceAnother: string;
  invoiceOpenBilling: string;
  invoiceMailSubject: string;
  invoiceMailBody: string;

  // payments and invoices
  billingTitle: string;
  billingSubtitle: string;
  billingNewInvoice: string;
  billingViewInvoices: string;
  billingViewPayments: string;
  billingSearch: string;
  billingSummaryOutstanding: string;
  billingSummaryOverdue: string;
  billingSummaryCollected: string;
  billingStatusDraft: string;
  billingStatusSent: string;
  billingStatusPartial: string;
  billingStatusPaid: string;
  billingStatusOverdue: string;
  billingTermsMonthly: string;
  billingTermsMonthlyHint: string;
  billingTermsImmediate: string;
  billingTermsImmediateHint: string;
  billingWalkInBadge: string;
  billingIssuedOn: string;
  billingDueOn: string;
  billingOverdueDays: string;
  billingFullyPaid: string;
  billingPaidOf: string;
  billingInvoiceAria: string;
  billingPaymentAria: string;
  billingEmptyInvoices: string;
  billingEmptyInvoicesHint: string;
  billingEmptyPayments: string;
  billingEmptyPaymentsHint: string;
  billingDetailTitle: string;
  billingDetailItems: string;
  billingDetailPaid: string;
  billingDetailBalance: string;
  billingDetailNotes: string;
  billingDetailPayments: string;
  billingDetailNoPayments: string;
  billingSentVia: string;
  billingRecordPayment: string;
  billingResend: string;
  billingSendNow: string;
  billingDeleteDraft: string;
  billingRemovePayment: string;
  billingPaymentTitle: string;
  billingPaymentFor: string;
  billingPaymentAmount: string;
  billingPaymentMethod: string;
  billingPaymentReference: string;
  billingPaymentReferencePlaceholder: string;
  billingPaymentSave: string;
  billingPaymentInvalid: string;
  payMethodCash: string;
  payMethodCard: string;
  payMethodTransfer: string;
  payMethodCheck: string;
  payMethodApp: string;

  // analytics
  analyticsTitle: string;
  analyticsSubtitle: string;
  analyticsRangeMonth: string;
  analyticsRangeQuarter: string;
  analyticsRangeHalf: string;
  analyticsHeroInvoiced: string;
  analyticsHeroCollected: string;
  analyticsCollectionRate: string;
  analyticsKpiOutstanding: string;
  analyticsKpiOverdue: string;
  analyticsOverdueCount: string;
  analyticsKpiAvgInvoice: string;
  analyticsInvoiceCount: string;
  analyticsKpiUnits: string;
  analyticsCounterShare: string;
  analyticsRevenueTitle: string;
  analyticsLegendInvoiced: string;
  analyticsLegendCollected: string;
  analyticsQualityTitle: string;
  analyticsKpiOnTime: string;
  analyticsKpiTurnaround: string;
  analyticsTurnaroundHint: string;
  analyticsServicesTitle: string;
  analyticsServiceUnits: string;
  analyticsDoctorsTitle: string;
  analyticsMethodsTitle: string;
  analyticsMethodCount: string;
  analyticsEmpty: string;
  analyticsEmptyHint: string;
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
    navCourier: 'Drivers',
    navTeam: 'Team & roles',
    navExocad: 'exocad demo',

    drawerWorkspace: 'Workspace',
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
    dashWorkPressure: 'work pressure',
    dashWorkPressureValue: '{percent}%',
    dashWorkPressureAria: 'Work pressure {percent} percent from {open} of {capacity} cases. Set capacity.',
    dashCapacityTitle: 'Order capacity',
    dashCapacityHint: 'How many open cases the lab can take on at once. Pressure is current cases divided by this number.',
    dashCapacityLabel: 'Capacity',
    dashCapacityOpen: '{count} open cases now',
    dashCapacityDecrease: 'Decrease capacity',
    dashCapacityIncrease: 'Increase capacity',
    dashRushJobs: '{count} rush jobs',
    dashPickups: '{count} pickups',
    dashProfile: 'Your profile',
    dashAttentionOne: '1 order needs your urgent attention',
    dashAttentionMany: '{count} orders need your urgent attention',
    dashAttentionAria: 'Review orders that need urgent attention',
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
    quickCourier: 'Drivers',
    quickScan: 'Scan code',
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
    roleReceptionist: 'Receptionist',
    roleStaffManager: 'Staff manager',
    roleWorker: 'Lab worker',
    roleDoctor: 'Doctor',
    roleDriver: 'Driver',
    roleLabOwnerHint: 'Full access, including billing, analytics and the team.',
    roleReceptionistHint: 'Front desk: invoices, payments, analytics, clients and cases.',
    roleStaffManagerHint: 'Runs the floor: cases, tasks and the team, but not the money.',
    roleWorkerHint: 'Works the cases and tasks assigned to them.',
    roleDoctorHint: 'A client of the lab: sees only their own cases and files.',
    roleDriverHint: 'Sees the delivery run and nothing else.',
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
    permViewBilling: 'View invoices and payments',
    permViewAnalytics: 'View analytics',
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
    statusInactive: 'Inactive',

    colDoctor: 'Doctor',
    colClinic: 'Clinic',
    colSpecialty: 'Specialty',
    colPhone: 'Phone',
    colActiveCases: 'Active cases',
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
    colPrice: 'Price',
    colTurnaround: 'Days',
    colCategory: 'Category',
    colEdit: 'Edit',

    doctorsTitle: 'Doctors',
    doctorsSubtitle: '{count} referring doctors',
    doctorsSearch: 'Search doctor, clinic or specialty',
    doctorsEmptyTitle: 'No doctors found',
    doctorsEmptyBody: 'Try a different search term or clear the filter.',
    doctorsAdd: 'Add doctor',
    doctorsAddTitle: 'New doctor',
    doctorsAddNamePlaceholder: 'Dr. Amir Saleh',
    doctorsAddClinicPlaceholder: 'Where they practise',

    clinicsTitle: 'Clinics',
    clinicsSubtitle: '{count} partner clinics',
    clinicsSearch: 'Search clinic or city',
    clinicsEmptyTitle: 'No clinics found',
    clinicsEmptyBody: 'Try a different search term or clear the filter.',
    clinicsAdd: 'Add clinic',
    clinicsAddTitle: 'New clinic',
    clinicsAddNamePlaceholder: 'Bright Smile Clinic',

    patientsTitle: 'Patients',
    patientsSubtitle: '{count} patients on file',
    patientsSearch: 'Search patient, case or doctor',
    patientsEmptyTitle: 'No patients found',
    patientsEmptyBody: 'Try a different search term or clear the filter.',
    patientsAdd: 'Add patient',
    patientsAddTitle: 'New patient',
    patientsAddNamePlaceholder: 'Patient full name',
    patientsAddDoctorPlaceholder: 'Referring doctor',
    patientsAddAgePlaceholder: 'Age in years',

    navWorkTypes: 'Work types',
    permViewWorkTypes: 'View work types',
    workTypesTitle: 'Work types',
    workTypesSubtitle: '{count} services in the price list',
    workTypesSearch: 'Search work type or category',
    workTypesEmptyTitle: 'No work types found',
    workTypesEmptyBody: 'Try a different search term or clear the filter.',
    workTypesAdd: 'Add work type',
    workTypesAddTitle: 'New work type',
    workTypesAddNamePlaceholder: 'Zirconia crown',
    workTypesAddPricePlaceholder: 'Price per unit',
    workTypesAddDaysPlaceholder: 'Working days until delivery',
    workTypesEditTitle: 'Edit work type',
    workTypesEditAria: 'Edit {name}',
    workTypeCrown: 'Crowns',
    workTypeBridge: 'Bridges',
    workTypeVeneer: 'Veneers',
    workTypeDenture: 'Dentures',
    workTypeImplant: 'Implants',
    workTypeAppliance: 'Appliances',

    quickAddName: 'Full name',
    quickAddEmail: 'Email',
    quickAddPhonePlaceholder: '050-000-0000',
    quickAddEmailPlaceholder: 'name@clinic.com',
    quickAddRequired: 'This field is required.',
    quickAddSave: 'Add to list',

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

    navTasks: 'Tasks',
    permManageTasks: 'Manage all tasks',
    tasksTitle: 'Tasks',
    tasksSubtitle: 'Internal work board',
    tasksTabMine: 'Mine',
    tasksTabReview: 'Review',
    tasksTabAll: 'All',
    tasksTabDone: 'Done',
    tasksEmptyMine: 'No tasks assigned to you',
    tasksEmptyMineHint: 'New assignments will appear here.',
    tasksEmptyAll: 'No open tasks',
    tasksEmptyAllHint: 'Create the first task for the team.',
    tasksEmptyReview: 'Nothing to review',
    tasksEmptyReviewHint: 'Tasks completed by the team wait here for confirmation.',
    tasksEmptyDone: 'Archive is empty',
    tasksEmptyDoneHint: 'Completed tasks will be kept here.',
    tasksNew: 'New task',
    tasksEditTask: 'Edit task',
    tasksNewTask: 'New task',
    tasksNewSubtask: 'New subtask',
    tasksAddSubtask: 'Add subtask',
    tasksFormTitle: 'Title',
    tasksFormTitlePlaceholder: 'e.g. Pour models for ND-2417',
    tasksFormNotes: 'Notes',
    tasksFormNotesPlaceholder: 'Details, instructions or context (optional)',
    tasksFormDueDate: 'Due date',
    tasksFormDueToday: 'Today',
    tasksFormDueTomorrow: 'Tomorrow',
    tasksFormDueNextWeek: 'Next week',
    tasksFormDueNone: 'No date',
    tasksFormAssignee: 'Assign to',
    tasksFormParent: 'Parent task',
    tasksTitleRequired: 'Enter a title before saving.',
    tasksMarkDone: 'Mark done',
    tasksReopen: 'Reopen',
    tasksConfirm: 'Confirm',
    tasksUndo: 'Undo',
    tasksDeleteTitle: 'Delete task',
    tasksDeleteBody: '“{title}” and its subtasks will be removed.',
    tasksDueToday: 'Due today',
    tasksDueTomorrow: 'Due tomorrow',
    tasksOverdue: 'Overdue',
    tasksSubtaskCount: '{count} subtasks',
    tasksSubtaskDetail: 'Subtask',
    tasksNoNotes: 'No notes on this subtask.',
    tasksOpenSubtaskAria: 'Open {title}',
    tasksCreatedBy: 'Created by {name}',
    tasksReviewHint: 'Completed — waiting for manager confirmation',
    tasksDragHandle: 'Drag to reorder',
    tasksMyTaskAria: '{title}, assigned to {assignee}',

    deliveriesTitle: 'Drivers',
    deliveriesSubtitle: '{stops} stops · {drivers} drivers',
    deliveriesToday: 'Today',
    deliveriesTomorrow: 'Tomorrow',
    deliveriesThisWeek: 'This week',
    deliveriesAllDrivers: 'All drivers',
    deliveriesStopsCount: '{count} stops',
    deliveriesCasesCount: '{count} cases',
    deliveriesSummaryStops: 'Stops',
    deliveriesSummaryCases: 'Cases',
    deliveriesSummaryCities: 'Cities',
    deliveriesKindDrop: 'Drop-off',
    deliveriesKindPickup: 'Pickup',
    deliveriesRushBadge: 'Rush',
    deliveriesAddress: '{street} {number}, {city}',
    deliveriesStopAria: 'Stop at {clinic}, {city}',
    deliveriesDriverAria: 'Show only {name}',
    deliveriesEmptyTitle: 'No stops scheduled',
    deliveriesEmptyBody: 'Choose another driver or switch to the weekly view.',

    navScan: 'Scan code',
    scanTitle: 'Scan code',
    scanSubtitle: 'QR codes and barcodes',
    scanHint: 'Hold the code inside the frame',
    scanPermissionTitle: 'Camera access needed',
    scanPermissionBody: 'The scanner uses the camera to read case QR codes and barcodes.',
    scanPermissionAction: 'Allow camera',
    scanPermissionBlockedTitle: 'Camera is blocked',
    scanPermissionBlockedBody: 'Enable camera access for this app in your device settings, then come back.',
    scanOpenSettings: 'Open settings',
    scanUnavailableTitle: 'Scanner unavailable',
    scanUnavailableBody: 'The camera could not start on this device. Try again in a moment.',
    scanRetry: 'Try again',
    scanTorchOn: 'Turn on flashlight',
    scanTorchOff: 'Turn off flashlight',
    scanFlipCamera: 'Switch camera',
    scanResultTitle: 'Code detected',
    scanResultFormat: 'Format · {type}',
    scanResultCode: 'Code',
    scanResultCopy: 'Copy code',
    scanResultCopied: 'Copied',
    scanResultAgain: 'Scan another',
    scanCameraAria: 'Camera viewfinder',

    navNewInvoice: 'New invoice',
    navBilling: 'Payments',
    drawerMoney: 'Money',
    invoiceNewTitle: 'New invoice',
    invoiceNewSubtitle: 'Invoice {id}',
    invoiceCustomerTitle: 'Customer',
    invoiceCustomerDoctor: 'Doctor',
    invoiceCustomerWalkIn: 'Walk-in',
    invoicePickDoctor: 'Choose a doctor',
    invoicePickDoctorHint: 'Billed to their monthly account.',
    invoiceWalkInHint: 'Pays at the counter, on the spot.',
    invoiceChangeDoctor: 'Change',
    invoiceDoctorSheetTitle: 'Choose a doctor',
    invoiceDoctorSearch: 'Search name or clinic',
    invoiceDoctorEmpty: 'No doctor found',
    invoiceDoctorEmptyHint: 'Try another name, or invoice them as a walk-in.',
    invoiceCustomerName: 'Full name',
    invoiceCustomerNamePlaceholder: 'Who is paying?',
    invoiceEmail: 'Email',
    invoiceEmailPlaceholder: 'name@example.com',
    invoicePhone: 'Phone',
    invoicePhonePlaceholder: '05X-XXX-XXXX',
    invoiceItemsTitle: 'Items',
    invoiceItemsHint: 'Tap a service to add it, tap again for another unit.',
    invoiceItemsEmpty: 'No items yet',
    invoiceItemsEmptyHint: 'Pick from the price list above.',
    invoiceAddServiceAria: 'Add {name}',
    invoiceCustomLine: 'Add a custom line',
    invoiceLineEach: '{price} each',
    invoiceLineRemove: 'Remove line',
    invoiceLineIncrease: 'One more',
    invoiceLineDecrease: 'One less',
    invoiceLineSheetNew: 'Custom line',
    invoiceLineSheetEdit: 'Edit line',
    invoiceLineDescription: 'Description',
    invoiceLineDescriptionPlaceholder: 'What are you charging for?',
    invoiceLineUnitPrice: 'Price per unit',
    invoiceLineQuantity: 'Quantity',
    invoiceLineRequired: 'Add a description and a price above zero.',
    invoiceTermsTitle: 'Payment terms',
    invoiceDueOn: 'Due {date}',
    invoiceNotesTitle: 'Note on the invoice',
    invoiceNotesPlaceholder: 'Anything the customer should read.',
    invoiceSubtotal: 'Subtotal',
    invoiceVat: 'VAT {rate}%',
    invoiceTotal: 'Total',
    invoiceSendTitle: 'Send',
    invoiceChannelEmail: 'Email',
    invoiceChannelApp: 'In the app',
    invoiceChannelEmailHint: 'Opens your mail app with the invoice ready to send.',
    invoiceChannelAppHint: '{name} gets it in their app inbox.',
    invoiceSend: 'Send invoice',
    invoiceSaveDraft: 'Save as draft',
    invoiceErrorCustomer: 'Choose who this invoice is for.',
    invoiceErrorEmail: 'A valid email address is needed to send it.',
    invoiceErrorLines: 'Add at least one item.',
    invoiceSentTitle: 'Invoice sent',
    invoiceSentBody: '{id} for {total} is on its way to {name}.',
    invoiceDraftSavedTitle: 'Draft saved',
    invoiceDraftSavedBody: '{id} is waiting in payments and invoices.',
    invoiceMailFallback:
      'No mail app answered. The invoice is saved, so you can send it again from payments.',
    invoiceAnother: 'New invoice',
    invoiceOpenBilling: 'Open payments',
    invoiceMailSubject: 'Invoice {id} · Nadeem Dental Lab',
    invoiceMailBody:
      'Hello {name},\n\nHere is invoice {id} for {total}, due {due}.\n\n{lines}\n\nThank you,\nNadeem Dental Lab',

    billingTitle: 'Payments & invoices',
    billingSubtitle: '{outstanding} open · {overdue} overdue',
    billingNewInvoice: 'New invoice',
    billingViewInvoices: 'Invoices',
    billingViewPayments: 'Payments',
    billingSearch: 'Search invoice, doctor or clinic',
    billingSummaryOutstanding: 'Open balance',
    billingSummaryOverdue: 'Overdue',
    billingSummaryCollected: 'In this month',
    billingStatusDraft: 'Draft',
    billingStatusSent: 'Sent',
    billingStatusPartial: 'Part paid',
    billingStatusPaid: 'Paid',
    billingStatusOverdue: 'Overdue',
    billingTermsMonthly: 'Monthly account',
    billingTermsMonthlyHint: 'Settled with the month-end statement.',
    billingTermsImmediate: 'Pay now',
    billingTermsImmediateHint: 'Due when the customer collects the work.',
    billingWalkInBadge: 'Walk-in',
    billingIssuedOn: 'Issued {date}',
    billingDueOn: 'Due {date}',
    billingOverdueDays: '{count} days overdue',
    billingFullyPaid: 'Fully paid',
    billingPaidOf: '{paid} of {total} received',
    billingInvoiceAria: 'Invoice {id} for {name}',
    billingPaymentAria: 'Payment of {amount} from {name}',
    billingEmptyInvoices: 'No invoices here',
    billingEmptyInvoicesHint: 'Change the filter, or issue a new invoice.',
    billingEmptyPayments: 'No payments yet',
    billingEmptyPaymentsHint: 'Money you record against an invoice shows up here.',
    billingDetailTitle: 'Invoice {id}',
    billingDetailItems: 'Items',
    billingDetailPaid: 'Received',
    billingDetailBalance: 'Balance',
    billingDetailNotes: 'Note',
    billingDetailPayments: 'Payments received',
    billingDetailNoPayments: 'Nothing received against this invoice yet.',
    billingSentVia: 'Sent by {channel}',
    billingRecordPayment: 'Record payment',
    billingResend: 'Send again',
    billingSendNow: 'Send by email',
    billingDeleteDraft: 'Delete draft',
    billingRemovePayment: 'Remove payment',
    billingPaymentTitle: 'Record payment',
    billingPaymentFor: 'Invoice {id} has {balance} open.',
    billingPaymentAmount: 'Amount received',
    billingPaymentMethod: 'How it was paid',
    billingPaymentReference: 'Reference',
    billingPaymentReferencePlaceholder: 'Cheque or transfer number',
    billingPaymentSave: 'Record',
    billingPaymentInvalid: 'Enter an amount up to the open balance.',
    payMethodCash: 'Cash',
    payMethodCard: 'Card',
    payMethodTransfer: 'Transfer',
    payMethodCheck: 'Cheque',
    payMethodApp: 'In app',

    analyticsTitle: 'Analytics',
    analyticsSubtitle: 'How the lab is trading',
    analyticsRangeMonth: 'This month',
    analyticsRangeQuarter: '3 months',
    analyticsRangeHalf: '6 months',
    analyticsHeroInvoiced: 'Invoiced',
    analyticsHeroCollected: 'Collected so far',
    analyticsCollectionRate: 'Collected',
    analyticsKpiOutstanding: 'Open balance',
    analyticsKpiOverdue: 'Overdue',
    analyticsOverdueCount: '{count} invoices',
    analyticsKpiAvgInvoice: 'Average invoice',
    analyticsInvoiceCount: '{count} invoices',
    analyticsKpiUnits: 'Units produced',
    analyticsCounterShare: '{percent}% at the counter',
    analyticsRevenueTitle: 'Invoiced against collected',
    analyticsLegendInvoiced: 'Invoiced',
    analyticsLegendCollected: 'Collected',
    analyticsQualityTitle: 'Production',
    analyticsKpiOnTime: 'Delivered on time',
    analyticsKpiTurnaround: 'Days per case',
    analyticsTurnaroundHint: 'From case received to case shipped.',
    analyticsServicesTitle: 'Revenue by service',
    analyticsServiceUnits: '{count} units',
    analyticsDoctorsTitle: 'Top doctors',
    analyticsMethodsTitle: 'How customers pay',
    analyticsMethodCount: '{count} payments',
    analyticsEmpty: 'Nothing invoiced yet',
    analyticsEmptyHint: 'Issue an invoice and the numbers will land here.',
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
    navCourier: 'שליחים',
    navTeam: 'צוות והרשאות',
    navExocad: 'הדגמת exocad',

    drawerWorkspace: 'סביבת עבודה',
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
    dashWorkPressure: 'לחץ עבודה',
    dashWorkPressureValue: '{percent}%',
    dashWorkPressureAria: 'לחץ עבודה {percent} אחוז מתוך {open} מול {capacity} תיקים. הגדרת קיבולת.',
    dashCapacityTitle: 'קיבולת הזמנות',
    dashCapacityHint: 'כמה תיקים פתוחים המעבדה יכולה לקחת במקביל. הלחץ הוא מספר התיקים הנוכחי חלקי מספר זה.',
    dashCapacityLabel: 'קיבולת',
    dashCapacityOpen: '{count} תיקים פתוחים כעת',
    dashCapacityDecrease: 'הפחתת קיבולת',
    dashCapacityIncrease: 'העלאת קיבולת',
    dashRushJobs: '{count} עבודות דחופות',
    dashPickups: '{count} איסופים',
    dashProfile: 'הפרופיל שלך',
    dashAttentionOne: 'הזמנה אחת דורשת טיפול דחוף',
    dashAttentionMany: '{count} הזמנות דורשות טיפול דחוף',
    dashAttentionAria: 'מעבר להזמנות שדורשות טיפול דחוף',
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
    quickCourier: 'שליחים',
    quickScan: 'סריקת קוד',
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
    roleReceptionist: 'פקיד קבלה',
    roleStaffManager: 'מנהל צוות',
    roleWorker: 'עובד מעבדה',
    roleDoctor: 'רופא',
    roleDriver: 'שליח',
    roleLabOwnerHint: 'גישה מלאה, כולל חשבוניות, אנליטיקה וניהול הצוות.',
    roleReceptionistHint: 'קבלה: חשבוניות, תשלומים, אנליטיקה, לקוחות ותיקים.',
    roleStaffManagerHint: 'מנהל את רצפת הייצור: תיקים, משימות וצוות — בלי כספים.',
    roleWorkerHint: 'עובד על התיקים והמשימות שהוקצו לו.',
    roleDoctorHint: 'לקוח של המעבדה: רואה רק את התיקים והקבצים שלו.',
    roleDriverHint: 'רואה את מסלול המשלוחים בלבד.',
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
    permViewBilling: 'צפייה בחשבוניות ותשלומים',
    permViewAnalytics: 'צפייה באנליטיקה',
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
    statusInactive: 'לא פעיל',

    colDoctor: 'רופא',
    colClinic: 'מרפאה',
    colSpecialty: 'התמחות',
    colPhone: 'טלפון',
    colActiveCases: 'תיקים פעילים',
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
    colPrice: 'מחיר',
    colTurnaround: 'ימים',
    colCategory: 'קטגוריה',
    colEdit: 'עריכה',

    doctorsTitle: 'רופאים',
    doctorsSubtitle: '{count} רופאים מפנים',
    doctorsSearch: 'חיפוש רופא, מרפאה או התמחות',
    doctorsEmptyTitle: 'לא נמצאו רופאים',
    doctorsEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',
    doctorsAdd: 'הוספת רופא',
    doctorsAddTitle: 'רופא חדש',
    doctorsAddNamePlaceholder: 'ד״ר אמיר סאלח',
    doctorsAddClinicPlaceholder: 'המרפאה שבה הוא עובד',

    clinicsTitle: 'מרפאות',
    clinicsSubtitle: '{count} מרפאות שותפות',
    clinicsSearch: 'חיפוש מרפאה או עיר',
    clinicsEmptyTitle: 'לא נמצאו מרפאות',
    clinicsEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',
    clinicsAdd: 'הוספת מרפאה',
    clinicsAddTitle: 'מרפאה חדשה',
    clinicsAddNamePlaceholder: 'מרפאת חיוך בריא',

    patientsTitle: 'מטופלים',
    patientsSubtitle: '{count} מטופלים בתיקייה',
    patientsSearch: 'חיפוש מטופל, תיק או רופא',
    patientsEmptyTitle: 'לא נמצאו מטופלים',
    patientsEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',
    patientsAdd: 'הוספת מטופל',
    patientsAddTitle: 'מטופל חדש',
    patientsAddNamePlaceholder: 'שם מלא של המטופל',
    patientsAddDoctorPlaceholder: 'הרופא המפנה',
    patientsAddAgePlaceholder: 'גיל בשנים',

    navWorkTypes: 'סוגי עבודה',
    permViewWorkTypes: 'צפייה בסוגי עבודה',
    workTypesTitle: 'סוגי עבודה',
    workTypesSubtitle: '{count} סוגי עבודה במחירון',
    workTypesSearch: 'חיפוש סוג עבודה או קטגוריה',
    workTypesEmptyTitle: 'לא נמצאו סוגי עבודה',
    workTypesEmptyBody: 'נסו מונח חיפוש אחר או נקו את הסינון.',
    workTypesAdd: 'הוספת סוג עבודה',
    workTypesAddTitle: 'סוג עבודה חדש',
    workTypesAddNamePlaceholder: 'כתר זירקוניה',
    workTypesAddPricePlaceholder: 'מחיר ליחידה',
    workTypesAddDaysPlaceholder: 'ימי עבודה עד המסירה',
    workTypesEditTitle: 'עריכת סוג עבודה',
    workTypesEditAria: 'עריכת {name}',
    workTypeCrown: 'כתרים',
    workTypeBridge: 'גשרים',
    workTypeVeneer: 'ציפויים',
    workTypeDenture: 'תותבות',
    workTypeImplant: 'שתלים',
    workTypeAppliance: 'סדים ומתקנים',

    quickAddName: 'שם מלא',
    quickAddEmail: 'אימייל',
    quickAddPhonePlaceholder: '050-000-0000',
    quickAddEmailPlaceholder: 'name@clinic.com',
    quickAddRequired: 'שדה חובה.',
    quickAddSave: 'הוספה לרשימה',

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

    navTasks: 'משימות',
    permManageTasks: 'ניהול כל המשימות',
    tasksTitle: 'משימות',
    tasksSubtitle: 'לוח העבודה הפנימי',
    tasksTabMine: 'שלי',
    tasksTabReview: 'לאישור',
    tasksTabAll: 'הכול',
    tasksTabDone: 'הושלמו',
    tasksEmptyMine: 'אין משימות שהוקצו לך',
    tasksEmptyMineHint: 'משימות חדשות שיוקצו יופיעו כאן.',
    tasksEmptyAll: 'אין משימות פתוחות',
    tasksEmptyAllHint: 'צרו את המשימה הראשונה עבור הצוות.',
    tasksEmptyReview: 'אין מה לאשר',
    tasksEmptyReviewHint: 'משימות שהושלמו על ידי הצוות ממתינות כאן לאישור.',
    tasksEmptyDone: 'הארכיון ריק',
    tasksEmptyDoneHint: 'משימות שהושלמו יישמרו כאן.',
    tasksNew: 'משימה חדשה',
    tasksEditTask: 'עריכת משימה',
    tasksNewTask: 'משימה חדשה',
    tasksNewSubtask: 'תת-משימה חדשה',
    tasksAddSubtask: 'הוספת תת-משימה',
    tasksFormTitle: 'כותרת',
    tasksFormTitlePlaceholder: 'לדוגמה: הלחמת מודלים עבור ND-2417',
    tasksFormNotes: 'הערות',
    tasksFormNotesPlaceholder: 'פרטים, הוראות או הקשר (אופציונלי)',
    tasksFormDueDate: 'תאריך יעד',
    tasksFormDueToday: 'היום',
    tasksFormDueTomorrow: 'מחר',
    tasksFormDueNextWeek: 'שבוע הבא',
    tasksFormDueNone: 'ללא תאריך',
    tasksFormAssignee: 'הקצאה אל',
    tasksFormParent: 'משימת אב',
    tasksTitleRequired: 'יש להזין כותרת לפני השמירה.',
    tasksMarkDone: 'סימון כהושלמה',
    tasksReopen: 'פתיחה מחדש',
    tasksConfirm: 'אישור',
    tasksUndo: 'ביטול',
    tasksDeleteTitle: 'מחיקת משימה',
    tasksDeleteBody: '״{title}״ ותת-המשימות שלה יימחקו.',
    tasksDueToday: 'ליעד היום',
    tasksDueTomorrow: 'ליעד מחר',
    tasksOverdue: 'באיחור',
    tasksSubtaskCount: '{count} תת-משימות',
    tasksSubtaskDetail: 'תת-משימה',
    tasksNoNotes: 'אין הערות לתת-משימה זו.',
    tasksOpenSubtaskAria: 'פתיחת {title}',
    tasksCreatedBy: 'נוצרה על ידי {name}',
    tasksReviewHint: 'הושלמה — ממתינה לאישור מנהל',
    tasksDragHandle: 'גרירה לשינוי סדר',
    tasksMyTaskAria: '{title}, מוקצית אל {assignee}',

    deliveriesTitle: 'שליחים',
    deliveriesSubtitle: '{stops} עצירות · {drivers} שליחים',
    deliveriesToday: 'היום',
    deliveriesTomorrow: 'מחר',
    deliveriesThisWeek: 'השבוע',
    deliveriesAllDrivers: 'כל השליחים',
    deliveriesStopsCount: '{count} עצירות',
    deliveriesCasesCount: '{count} עבודות',
    deliveriesSummaryStops: 'עצירות',
    deliveriesSummaryCases: 'עבודות',
    deliveriesSummaryCities: 'ערים',
    deliveriesKindDrop: 'מסירה',
    deliveriesKindPickup: 'איסוף',
    deliveriesRushBadge: 'דחוף',
    deliveriesAddress: '{street} {number}, {city}',
    deliveriesStopAria: 'עצירה ב{clinic}, {city}',
    deliveriesDriverAria: 'הצגת {name} בלבד',
    deliveriesEmptyTitle: 'אין עצירות מתוכננות',
    deliveriesEmptyBody: 'בחרו שליח אחר או עברו לתצוגה השבועית.',

    navScan: 'סריקת קוד',
    scanTitle: 'סריקת קוד',
    scanSubtitle: 'קודי QR וברקודים',
    scanHint: 'החזיקו את הקוד בתוך המסגרת',
    scanPermissionTitle: 'נדרשת הרשאה למצלמה',
    scanPermissionBody: 'הסורק משתמש במצלמה כדי לקרוא קודי QR וברקודים של תיקים.',
    scanPermissionAction: 'אישור המצלמה',
    scanPermissionBlockedTitle: 'המצלמה חסומה',
    scanPermissionBlockedBody: 'אפשרו גישה למצלמה עבור האפליקציה בהגדרות המכשיר, ואז חזרו לכאן.',
    scanOpenSettings: 'פתיחת ההגדרות',
    scanUnavailableTitle: 'הסורק אינו זמין',
    scanUnavailableBody: 'לא ניתן להפעיל את המצלמה במכשיר הזה. נסו שוב בעוד רגע.',
    scanRetry: 'נסו שוב',
    scanTorchOn: 'הדלקת הפנס',
    scanTorchOff: 'כיבוי הפנס',
    scanFlipCamera: 'החלפת מצלמה',
    scanResultTitle: 'קוד זוהה',
    scanResultFormat: 'פורמט · {type}',
    scanResultCode: 'קוד',
    scanResultCopy: 'העתקת הקוד',
    scanResultCopied: 'הועתק',
    scanResultAgain: 'סריקה נוספת',
    scanCameraAria: 'תצוגת המצלמה',

    navNewInvoice: 'חשבונית חדשה',
    navBilling: 'תשלומים',
    drawerMoney: 'כספים',
    invoiceNewTitle: 'חשבונית חדשה',
    invoiceNewSubtitle: 'חשבונית {id}',
    invoiceCustomerTitle: 'לקוח',
    invoiceCustomerDoctor: 'רופא',
    invoiceCustomerWalkIn: 'לקוח מזדמן',
    invoicePickDoctor: 'בחירת רופא',
    invoicePickDoctorHint: 'מחויב בחשבון החודשי שלו.',
    invoiceWalkInHint: 'משלם בדלפק, במקום.',
    invoiceChangeDoctor: 'החלפה',
    invoiceDoctorSheetTitle: 'בחירת רופא',
    invoiceDoctorSearch: 'חיפוש שם או מרפאה',
    invoiceDoctorEmpty: 'לא נמצא רופא',
    invoiceDoctorEmptyHint: 'נסו שם אחר, או הפיקו חשבונית ללקוח מזדמן.',
    invoiceCustomerName: 'שם מלא',
    invoiceCustomerNamePlaceholder: 'מי משלם?',
    invoiceEmail: 'אימייל',
    invoiceEmailPlaceholder: 'name@example.com',
    invoicePhone: 'טלפון',
    invoicePhonePlaceholder: '05X-XXX-XXXX',
    invoiceItemsTitle: 'פריטים',
    invoiceItemsHint: 'הקשה על שירות מוסיפה אותו, הקשה נוספת מוסיפה יחידה.',
    invoiceItemsEmpty: 'אין פריטים',
    invoiceItemsEmptyHint: 'בחרו מהמחירון שלמעלה.',
    invoiceAddServiceAria: 'הוספת {name}',
    invoiceCustomLine: 'הוספת שורה חופשית',
    invoiceLineEach: '{price} ליחידה',
    invoiceLineRemove: 'הסרת שורה',
    invoiceLineIncrease: 'יחידה נוספת',
    invoiceLineDecrease: 'יחידה פחות',
    invoiceLineSheetNew: 'שורה חופשית',
    invoiceLineSheetEdit: 'עריכת שורה',
    invoiceLineDescription: 'תיאור',
    invoiceLineDescriptionPlaceholder: 'על מה החיוב?',
    invoiceLineUnitPrice: 'מחיר ליחידה',
    invoiceLineQuantity: 'כמות',
    invoiceLineRequired: 'הוסיפו תיאור ומחיר גדול מאפס.',
    invoiceTermsTitle: 'תנאי תשלום',
    invoiceDueOn: 'לתשלום עד {date}',
    invoiceNotesTitle: 'הערה לחשבונית',
    invoiceNotesPlaceholder: 'כל מה שהלקוח צריך לדעת.',
    invoiceSubtotal: 'סכום לפני מע״מ',
    invoiceVat: 'מע״מ {rate}%',
    invoiceTotal: 'סה״כ',
    invoiceSendTitle: 'שליחה',
    invoiceChannelEmail: 'אימייל',
    invoiceChannelApp: 'באפליקציה',
    invoiceChannelEmailHint: 'ייפתח יישום הדואר עם החשבונית מוכנה לשליחה.',
    invoiceChannelAppHint: '{name} יקבל אותה בתיבה באפליקציה.',
    invoiceSend: 'שליחת חשבונית',
    invoiceSaveDraft: 'שמירה כטיוטה',
    invoiceErrorCustomer: 'בחרו עבור מי החשבונית.',
    invoiceErrorEmail: 'נדרשת כתובת אימייל תקינה לשליחה.',
    invoiceErrorLines: 'הוסיפו פריט אחד לפחות.',
    invoiceSentTitle: 'החשבונית נשלחה',
    invoiceSentBody: '{id} בסך {total} בדרך אל {name}.',
    invoiceDraftSavedTitle: 'הטיוטה נשמרה',
    invoiceDraftSavedBody: '{id} ממתינה במסך התשלומים והחשבוניות.',
    invoiceMailFallback:
      'לא נמצא יישום דואר. החשבונית נשמרה, אפשר לשלוח אותה שוב ממסך התשלומים.',
    invoiceAnother: 'חשבונית חדשה',
    invoiceOpenBilling: 'למסך התשלומים',
    invoiceMailSubject: 'חשבונית {id} · Nadeem Dental Lab',
    invoiceMailBody:
      'שלום {name},\n\nלפניך חשבונית {id} בסך {total}, לתשלום עד {due}.\n\n{lines}\n\nתודה,\nNadeem Dental Lab',

    billingTitle: 'תשלומים וחשבוניות',
    billingSubtitle: '{outstanding} פתוח · {overdue} באיחור',
    billingNewInvoice: 'חשבונית חדשה',
    billingViewInvoices: 'חשבוניות',
    billingViewPayments: 'תשלומים',
    billingSearch: 'חיפוש חשבונית, רופא או מרפאה',
    billingSummaryOutstanding: 'יתרה פתוחה',
    billingSummaryOverdue: 'באיחור',
    billingSummaryCollected: 'נכנס החודש',
    billingStatusDraft: 'טיוטה',
    billingStatusSent: 'נשלחה',
    billingStatusPartial: 'שולם חלקית',
    billingStatusPaid: 'שולם',
    billingStatusOverdue: 'באיחור',
    billingTermsMonthly: 'חשבון חודשי',
    billingTermsMonthlyHint: 'נסגר בריכוז החיובים בסוף החודש.',
    billingTermsImmediate: 'תשלום מיד',
    billingTermsImmediateHint: 'לתשלום באיסוף העבודה.',
    billingWalkInBadge: 'לקוח מזדמן',
    billingIssuedOn: 'הופקה ב־{date}',
    billingDueOn: 'לתשלום עד {date}',
    billingOverdueDays: 'באיחור {count} ימים',
    billingFullyPaid: 'שולם במלואו',
    billingPaidOf: 'התקבלו {paid} מתוך {total}',
    billingInvoiceAria: 'חשבונית {id} של {name}',
    billingPaymentAria: 'תשלום בסך {amount} מ־{name}',
    billingEmptyInvoices: 'אין חשבוניות כאן',
    billingEmptyInvoicesHint: 'שנו את הסינון, או הפיקו חשבונית חדשה.',
    billingEmptyPayments: 'אין תשלומים',
    billingEmptyPaymentsHint: 'תשלום שתרשמו מול חשבונית יופיע כאן.',
    billingDetailTitle: 'חשבונית {id}',
    billingDetailItems: 'פריטים',
    billingDetailPaid: 'התקבל',
    billingDetailBalance: 'יתרה',
    billingDetailNotes: 'הערה',
    billingDetailPayments: 'תשלומים שהתקבלו',
    billingDetailNoPayments: 'עוד לא התקבל תשלום מול החשבונית.',
    billingSentVia: 'נשלחה ב{channel}',
    billingRecordPayment: 'רישום תשלום',
    billingResend: 'שליחה שוב',
    billingSendNow: 'שליחה באימייל',
    billingDeleteDraft: 'מחיקת הטיוטה',
    billingRemovePayment: 'הסרת התשלום',
    billingPaymentTitle: 'רישום תשלום',
    billingPaymentFor: 'בחשבונית {id} פתוחים {balance}.',
    billingPaymentAmount: 'סכום שהתקבל',
    billingPaymentMethod: 'אמצעי תשלום',
    billingPaymentReference: 'אסמכתא',
    billingPaymentReferencePlaceholder: 'מספר צ׳ק או העברה',
    billingPaymentSave: 'רישום',
    billingPaymentInvalid: 'הזינו סכום עד גובה היתרה הפתוחה.',
    payMethodCash: 'מזומן',
    payMethodCard: 'כרטיס',
    payMethodTransfer: 'העברה',
    payMethodCheck: 'צ׳ק',
    payMethodApp: 'באפליקציה',

    analyticsTitle: 'אנליטיקה',
    analyticsSubtitle: 'איך המעבדה עובדת',
    analyticsRangeMonth: 'החודש',
    analyticsRangeQuarter: '3 חודשים',
    analyticsRangeHalf: '6 חודשים',
    analyticsHeroInvoiced: 'חויב',
    analyticsHeroCollected: 'נגבה עד כה',
    analyticsCollectionRate: 'נגבה',
    analyticsKpiOutstanding: 'יתרה פתוחה',
    analyticsKpiOverdue: 'באיחור',
    analyticsOverdueCount: '{count} חשבוניות',
    analyticsKpiAvgInvoice: 'חשבונית ממוצעת',
    analyticsInvoiceCount: '{count} חשבוניות',
    analyticsKpiUnits: 'יחידות שיוצרו',
    analyticsCounterShare: '{percent}% מכירה בדלפק',
    analyticsRevenueTitle: 'חיוב מול גבייה',
    analyticsLegendInvoiced: 'חויב',
    analyticsLegendCollected: 'נגבה',
    analyticsQualityTitle: 'ייצור',
    analyticsKpiOnTime: 'נמסר בזמן',
    analyticsKpiTurnaround: 'ימים לעבודה',
    analyticsTurnaroundHint: 'מקבלת העבודה ועד המשלוח.',
    analyticsServicesTitle: 'הכנסות לפי שירות',
    analyticsServiceUnits: '{count} יחידות',
    analyticsDoctorsTitle: 'הרופאים המובילים',
    analyticsMethodsTitle: 'איך הלקוחות משלמים',
    analyticsMethodCount: '{count} תשלומים',
    analyticsEmpty: 'לא הופקו חשבוניות',
    analyticsEmptyHint: 'הפיקו חשבונית והמספרים יופיעו כאן.',
  },
};
