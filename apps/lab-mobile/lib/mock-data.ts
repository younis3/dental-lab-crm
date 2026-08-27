import type { Href } from 'expo-router';

import type { IconName } from '@/components/ui/icon';
import type { Tone } from '@/components/ui/pill';
import type { LocalizedText, MaybeLocalized, UiStrings } from '@/lib/i18n';
import type { Permission } from '@/lib/roles';

export type OrderStage = 'received' | 'design' | 'production' | 'quality' | 'courier' | 'delivered';

export const STAGE_META: Record<
  OrderStage,
  { labelKey: keyof UiStrings; tone: Tone; icon: IconName }
> = {
  received: { labelKey: 'stageReceived', tone: 'neutral', icon: 'download-outline' },
  design: { labelKey: 'stageDesign', tone: 'accent', icon: 'color-palette-outline' },
  production: { labelKey: 'stageProduction', tone: 'brand', icon: 'construct-outline' },
  quality: { labelKey: 'stageQuality', tone: 'warning', icon: 'shield-checkmark-outline' },
  courier: { labelKey: 'stageCourier', tone: 'accent', icon: 'car-outline' },
  delivered: { labelKey: 'stageDelivered', tone: 'success', icon: 'checkmark-done-outline' },
};

export type Order = {
  id: string;
  patient: string;
  clinic: string;
  doctor: string;
  workType: LocalizedText;
  shade: string;
  teeth: MaybeLocalized;
  stage: OrderStage;
  /** 0 – 1 completion of the lab pipeline. */
  progress: number;
  dueLabel: LocalizedText;
  urgent: boolean;
  favorite: boolean;
};

export const ORDERS: Order[] = [
  {
    id: 'ND-2418',
    patient: 'Layla Hassan',
    clinic: 'Bright Smile Clinic',
    doctor: 'Dr. Amir Saleh',
    workType: { en: 'Zirconia crown', he: 'כתר זירקוניה' },
    shade: 'A2',
    teeth: '#14, #15',
    stage: 'quality',
    progress: 0.82,
    dueLabel: { en: 'Due tomorrow', he: 'ליעד מחר' },
    urgent: true,
    favorite: true,
  },
  {
    id: 'ND-2417',
    patient: 'Omar Khalil',
    clinic: 'Dentaris Center',
    doctor: 'Dr. Rana Odeh',
    workType: {
      en: 'Full arch implant bridge',
      he: 'גשר על שתלים, קשת מלאה',
    },
    shade: 'B1',
    teeth: { en: 'Upper arch', he: 'קשת עליונה' },
    stage: 'production',
    progress: 0.54,
    dueLabel: { en: 'Due in 3 days', he: 'ליעד בעוד 3 ימים' },
    urgent: true,
    favorite: true,
  },
  {
    id: 'ND-2415',
    patient: 'Maya Cohen',
    clinic: 'Bright Smile Clinic',
    doctor: 'Dr. Amir Saleh',
    workType: { en: 'E-max veneers ×6', he: '6 ציפויי E-max' },
    shade: 'BL2',
    teeth: '#11 – #23',
    stage: 'design',
    progress: 0.31,
    dueLabel: { en: 'Due in 5 days', he: 'ליעד בעוד 5 ימים' },
    urgent: false,
    favorite: false,
  },
  {
    id: 'ND-2412',
    patient: 'Yusuf Amara',
    clinic: 'Peak Dental Studio',
    doctor: 'Dr. Lina Farah',
    workType: { en: 'Night guard', he: 'סד לילה' },
    shade: 'Clear',
    teeth: { en: 'Lower arch', he: 'קשת תחתונה' },
    stage: 'courier',
    progress: 0.93,
    dueLabel: { en: 'Picked up 09:40', he: 'נאסף ב-09:40' },
    urgent: false,
    favorite: false,
  },
  {
    id: 'ND-2409',
    patient: 'Sara Mansour',
    clinic: 'Dentaris Center',
    doctor: 'Dr. Rana Odeh',
    workType: { en: 'PFM crown', he: 'כתר חרסינה על מתכת' },
    shade: 'A3.5',
    teeth: '#26',
    stage: 'received',
    progress: 0.12,
    dueLabel: { en: 'Due in 6 days', he: 'ליעד בעוד 6 ימים' },
    urgent: false,
    favorite: false,
  },
  {
    id: 'ND-2402',
    patient: 'Adam Nassar',
    clinic: 'Peak Dental Studio',
    doctor: 'Dr. Lina Farah',
    workType: { en: 'Inlay / onlay', he: 'אינליי / אונליי' },
    shade: 'A1',
    teeth: '#36',
    stage: 'delivered',
    progress: 1,
    dueLabel: { en: 'Delivered Tue', he: 'נמסר ביום ג׳' },
    urgent: false,
    favorite: false,
  },
];

export type Message = {
  id: string;
  sender: MaybeLocalized;
  initials: string;
  clinic: MaybeLocalized;
  preview: LocalizedText;
  time: LocalizedText;
  unread: boolean;
  priority: 'normal' | 'high' | 'action';
  orderId?: string;
};

export const MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'Dr. Amir Saleh',
    initials: 'AS',
    clinic: 'Bright Smile Clinic',
    preview: {
      en: 'The shade on ND-2418 looks a touch light in the photos — can we warm it up?',
      he: 'הגוון של ND-2418 נראה מעט בהיר מדי בתמונות — אפשר לחמם אותו?',
    },
    time: { en: '2m', he: '2 דק׳' },
    unread: true,
    priority: 'action',
    orderId: 'ND-2418',
  },
  {
    id: 'm2',
    sender: 'Dr. Rana Odeh',
    initials: 'RO',
    clinic: 'Dentaris Center',
    preview: {
      en: 'New STL scan uploaded for the full arch case. Please confirm you can open it.',
      he: 'הועלתה סריקת STL חדשה לתיק הקשת המלאה. אנא אשרו שניתן לפתוח אותה.',
    },
    time: { en: '18m', he: '18 דק׳' },
    unread: true,
    priority: 'high',
    orderId: 'ND-2417',
  },
  {
    id: 'm3',
    sender: { en: 'Courier — Sami', he: 'שליח — סמי' },
    initials: 'CS',
    clinic: { en: 'Logistics', he: 'לוגיסטיקה' },
    preview: {
      en: 'Pickup completed at Peak Dental Studio, 4 impressions collected.',
      he: 'האיסוף הושלם ב-Peak Dental Studio, נאספו 4 הטבעות.',
    },
    time: { en: '1h', he: 'שעה' },
    unread: false,
    priority: 'normal',
  },
  {
    id: 'm4',
    sender: 'Dr. Lina Farah',
    initials: 'LF',
    clinic: 'Peak Dental Studio',
    preview: {
      en: 'Thanks for the fast turnaround on the night guard, patient is happy.',
      he: 'תודה על הזמן המהיר בסד הלילה, המטופל מרוצה.',
    },
    time: { en: 'Yesterday', he: 'אתמול' },
    unread: false,
    priority: 'normal',
    orderId: 'ND-2412',
  },
  {
    id: 'm5',
    sender: { en: 'Accounts', he: 'הנהלת חשבונות' },
    initials: 'AC',
    clinic: 'Nadeem Dental Lab',
    preview: {
      en: 'Invoice #4471 for Dentaris Center is now 12 days overdue.',
      he: 'חשבונית #4471 עבור Dentaris Center באיחור של 12 ימים.',
    },
    time: { en: 'Yesterday', he: 'אתמול' },
    unread: false,
    priority: 'high',
  },
];

export type FileFolder = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  icon: IconName;
  tone: Tone;
  count: number;
  size: string;
};

export const FOLDERS: FileFolder[] = [
  {
    id: 'f1',
    name: { en: 'Intraoral scans', he: 'סריקות תוך-פה' },
    description: {
      en: 'STL & PLY files from clinics',
      he: 'קבצי STL ו-PLY ממרפאות',
    },
    icon: 'cube-outline',
    tone: 'brand',
    count: 148,
    size: '12.4 GB',
  },
  {
    id: 'f2',
    name: { en: 'Case photography', he: 'צילומי תיקים' },
    description: {
      en: 'Shade matching and try-in shots',
      he: 'התאמת גוון ותמונות מדידה',
    },
    icon: 'image-outline',
    tone: 'accent',
    count: 512,
    size: '4.1 GB',
  },
  {
    id: 'f3',
    name: { en: 'Prescriptions', he: 'הזמנות עבודה' },
    description: {
      en: 'Signed lab work orders',
      he: 'הזמנות עבודה חתומות',
    },
    icon: 'document-text-outline',
    tone: 'success',
    count: 96,
    size: '312 MB',
  },
  {
    id: 'f4',
    name: { en: 'Invoices & receipts', he: 'חשבוניות וקבלות' },
    description: {
      en: 'Billing exports per clinic',
      he: 'ייצוא חיובים לפי מרפאה',
    },
    icon: 'receipt-outline',
    tone: 'warning',
    count: 74,
    size: '128 MB',
  },
];

export type RecentFile = {
  id: string;
  name: string;
  meta: LocalizedText;
  icon: IconName;
  tone: Tone;
};

export const RECENT_FILES: RecentFile[] = [
  {
    id: 'r1',
    name: 'ND-2418_upper.stl',
    meta: { en: '48 MB · 2 hours ago', he: '48 MB · לפני שעתיים' },
    icon: 'cube-outline',
    tone: 'brand',
  },
  {
    id: 'r2',
    name: 'shade_match_A2.jpg',
    meta: { en: '3.2 MB · 4 hours ago', he: '3.2 MB · לפני 4 שעות' },
    icon: 'image-outline',
    tone: 'accent',
  },
  {
    id: 'r3',
    name: 'RX_ND-2417.pdf',
    meta: { en: '820 KB · Yesterday', he: '820 KB · אתמול' },
    icon: 'document-text-outline',
    tone: 'success',
  },
];

export const STORAGE = { used: '16.9 GB', total: '27 GB', ratio: 0.62 };

export type Activity = {
  id: string;
  title: LocalizedText;
  detail: MaybeLocalized;
  time: LocalizedText;
  icon: IconName;
  tone: Tone;
};

export const ACTIVITY: Activity[] = [
  {
    id: 'a1',
    title: {
      en: 'ND-2418 passed quality check',
      he: 'ND-2418 עבר בקרת איכות',
    },
    detail: {
      en: 'Zirconia crown ready for glazing',
      he: 'כתר זירקוניה מוכן להזגגה',
    },
    time: { en: '12m ago', he: 'לפני 12 דק׳' },
    icon: 'shield-checkmark-outline',
    tone: 'success',
  },
  {
    id: 'a2',
    title: {
      en: 'New case from Dentaris Center',
      he: 'תיק חדש מ-Dentaris Center',
    },
    detail: {
      en: 'Full arch implant bridge, upper',
      he: 'גשר על שתלים, קשת עליונה',
    },
    time: { en: '46m ago', he: 'לפני 46 דק׳' },
    icon: 'add-circle-outline',
    tone: 'brand',
  },
  {
    id: 'a3',
    title: {
      en: 'Courier pickup scheduled',
      he: 'נקבע איסוף שליח',
    },
    detail: {
      en: 'Peak Dental Studio · today 16:30',
      he: 'Peak Dental Studio · היום 16:30',
    },
    time: { en: '2h ago', he: 'לפני שעתיים' },
    icon: 'car-outline',
    tone: 'accent',
  },
  {
    id: 'a4',
    title: {
      en: 'Invoice #4471 overdue',
      he: 'חשבונית #4471 באיחור',
    },
    detail: 'Dentaris Center · ₪2,480',
    time: { en: '5h ago', he: 'לפני 5 שעות' },
    icon: 'alert-circle-outline',
    tone: 'danger',
  },
];

export const PIPELINE: { key: string; labelKey: keyof UiStrings; value: number; tone: Tone }[] = [
  { key: 'design', labelKey: 'stageShortDesign', value: 6, tone: 'accent' },
  { key: 'production', labelKey: 'stageShortProduction', value: 11, tone: 'brand' },
  { key: 'quality', labelKey: 'stageShortQuality', value: 4, tone: 'warning' },
  { key: 'courier', labelKey: 'stageShortCourier', value: 3, tone: 'success' },
];

export type QuickAction = {
  id: string;
  labelKey: keyof UiStrings;
  icon: IconName;
  tone: Tone;
  /** Tiles without a destination are still placeholders. */
  route?: Href;
  /** Hidden unless the signed-in user holds this permission. */
  permission?: Permission;
};

export const QUICK_ACTIONS: QuickAction[] = [
  { id: 'q1', labelKey: 'quickNewCase', icon: 'add-outline', tone: 'brand' },
  { id: 'q2', labelKey: 'quickCourier', icon: 'car-outline', tone: 'accent', route: '/deliveries' },
  { id: 'q3', labelKey: 'quickScan', icon: 'scan-outline', tone: 'success', route: '/scan' },
  {
    id: 'q4',
    labelKey: 'quickInvoice',
    icon: 'receipt-outline',
    tone: 'warning',
    route: '/invoice-new',
    permission: 'viewBilling',
  },
];
