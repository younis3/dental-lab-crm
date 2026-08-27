import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';

import type { IconName } from '@/components/ui/icon';
import type { Tone } from '@/components/ui/pill';
import type { LocalizedText, UiStrings } from '@/lib/i18n';
import { createStore } from '@/lib/store';

export type NotificationType = 'newCase' | 'dueSoon' | 'message' | 'delivery' | 'invoice';

export const NOTIFICATION_TYPES: readonly NotificationType[] = [
  'newCase',
  'dueSoon',
  'message',
  'delivery',
  'invoice',
];

export const NOTIFICATION_META: Record<
  NotificationType,
  { labelKey: keyof UiStrings; hintKey: keyof UiStrings; icon: IconName; tone: Tone }
> = {
  newCase: {
    labelKey: 'notifTypeNewCase',
    hintKey: 'notifTypeNewCaseHint',
    icon: 'add-circle-outline',
    tone: 'brand',
  },
  dueSoon: {
    labelKey: 'notifTypeDueSoon',
    hintKey: 'notifTypeDueSoonHint',
    icon: 'time-outline',
    tone: 'warning',
  },
  message: {
    labelKey: 'notifTypeMessage',
    hintKey: 'notifTypeMessageHint',
    icon: 'chatbubbles-outline',
    tone: 'accent',
  },
  delivery: {
    labelKey: 'notifTypeDelivery',
    hintKey: 'notifTypeDeliveryHint',
    icon: 'car-outline',
    tone: 'success',
  },
  invoice: {
    labelKey: 'notifTypeInvoice',
    hintKey: 'notifTypeInvoiceHint',
    icon: 'receipt-outline',
    tone: 'danger',
  },
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  body: LocalizedText;
  /** Case this notification points at, when there is one. */
  orderId?: string;
  /** ISO timestamp. */
  createdAt: string;
  read: boolean;
};

type EnabledTypes = Record<NotificationType, boolean>;

const ALL_ENABLED: EnabledTypes = {
  newCase: true,
  dueSoon: true,
  message: true,
  delivery: true,
  invoice: true,
};

const PREFS_KEY = 'lab-mobile:notification-types';

/** Seeded relative to launch so the "how long ago" labels always read naturally. */
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const SEED: NotificationItem[] = [
  {
    id: 'n1',
    type: 'newCase',
    body: {
      en: 'Dentaris Center submitted ND-2417 — full arch implant bridge.',
      he: 'Dentaris Center שלחה את ND-2417 — גשר על שתלים בקשת מלאה.',
    },
    orderId: 'ND-2417',
    createdAt: minutesAgo(4),
    read: false,
  },
  {
    id: 'n2',
    type: 'dueSoon',
    body: {
      en: 'ND-2418 is due tomorrow and still waiting on glazing.',
      he: 'ND-2418 ליעד מחר ועדיין ממתין להזגגה.',
    },
    orderId: 'ND-2418',
    createdAt: minutesAgo(26),
    read: false,
  },
  {
    id: 'n3',
    type: 'message',
    body: {
      en: 'Dr. Amir Saleh asked about the shade on ND-2418.',
      he: 'ד״ר אמיר סאלח שאל לגבי הגוון של ND-2418.',
    },
    orderId: 'ND-2418',
    createdAt: minutesAgo(52),
    read: false,
  },
  {
    id: 'n4',
    type: 'delivery',
    body: {
      en: 'Sami collected 4 impressions from Peak Dental Studio.',
      he: 'סמי אסף 4 הטבעות מ-Peak Dental Studio.',
    },
    createdAt: minutesAgo(140),
    read: true,
  },
  {
    id: 'n5',
    type: 'invoice',
    body: {
      en: 'Invoice #4471 for Dentaris Center is 12 days overdue.',
      he: 'חשבונית #4471 עבור Dentaris Center באיחור של 12 ימים.',
    },
    createdAt: minutesAgo(320),
    read: true,
  },
  {
    id: 'n6',
    type: 'newCase',
    body: {
      en: 'Bright Smile Clinic submitted ND-2415 — six E-max veneers.',
      he: 'Bright Smile Clinic שלחה את ND-2415 — שישה ציפויי E-max.',
    },
    orderId: 'ND-2415',
    createdAt: minutesAgo(1180),
    read: true,
  },
  {
    id: 'n7',
    type: 'delivery',
    body: {
      en: 'ND-2412 night guard was delivered and signed for.',
      he: 'סד הלילה ND-2412 נמסר ונחתם.',
    },
    orderId: 'ND-2412',
    createdAt: minutesAgo(2600),
    read: true,
  },
];

const store = createStore<{ items: NotificationItem[]; enabledTypes: EnabledTypes }>({
  items: SEED,
  enabledTypes: { ...ALL_ENABLED },
});

/**
 * Muted types are filtered on read rather than on write, so switching one back
 * on immediately restores its history instead of losing it.
 */
export function useNotifications() {
  const { items, enabledTypes } = store.use();

  return useMemo(() => {
    const visible = items.filter((item) => enabledTypes[item.type]);
    return {
      items: visible,
      enabledTypes,
      unread: visible.reduce((count, item) => (item.read ? count : count + 1), 0),
    };
  }, [enabledTypes, items]);
}

export function setNotificationTypeEnabled(type: NotificationType, enabled: boolean) {
  store.set((prev) => {
    const enabledTypes = { ...prev.enabledTypes, [type]: enabled };
    void AsyncStorage.setItem(PREFS_KEY, JSON.stringify(enabledTypes));
    return { ...prev, enabledTypes };
  });
}

export function markNotificationRead(id: string) {
  store.set((prev) => ({
    ...prev,
    items: prev.items.map((item) => (item.id === id ? { ...item, read: true } : item)),
  }));
}

export function markAllNotificationsRead() {
  store.set((prev) => ({
    ...prev,
    items: prev.items.map((item) =>
      item.read || !prev.enabledTypes[item.type] ? item : { ...item, read: true }
    ),
  }));
}

export async function hydrateNotificationPrefs() {
  try {
    const saved = await AsyncStorage.getItem(PREFS_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Partial<EnabledTypes>;
    store.set((prev) => ({
      ...prev,
      enabledTypes: NOTIFICATION_TYPES.reduce<EnabledTypes>(
        (acc, type) => ({ ...acc, [type]: parsed[type] !== false }),
        { ...ALL_ENABLED }
      ),
    }));
  } catch {
    await AsyncStorage.removeItem(PREFS_KEY);
  }
}
