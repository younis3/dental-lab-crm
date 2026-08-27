import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';

import type { MaybeLocalized } from '@/lib/i18n';
import { createStore } from '@/lib/store';

/** What a single attachment on a chat bubble points at. */
export type ChatAttachmentKind = 'image' | 'video' | 'file' | 'scan';

export type ChatAttachment = {
  id: string;
  name: string;
  kind: ChatAttachmentKind;
  /** Local file URI for previewable attachments, e.g. a picked photo. */
  uri?: string;
};

/**
 * One message inside a thread. Seeded ("them") bubbles ship in every language,
 * so their text is `MaybeLocalized`; anything the lab types is a plain string.
 */
export type ChatBubble = {
  id: string;
  author: 'me' | 'them';
  text?: MaybeLocalized;
  attachment?: ChatAttachment;
  /** ISO timestamp. */
  at: string;
};

export type ChatPriority = 'normal' | 'high' | 'action';

export type Conversation = {
  id: string;
  name: MaybeLocalized;
  initials: string;
  clinic: MaybeLocalized;
  /** Case this thread is attached to, when there is one. */
  orderId?: string;
  priority: ChatPriority;
  /** The lab's own support line, pinned above the clinics. */
  support?: boolean;
  bubbles: ChatBubble[];
  /** Unread inbound bubbles waiting for the lab. */
  unread: number;
};

const STORAGE_KEY = 'lab-mobile:chat:v1';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const SEED: Conversation[] = [
  {
    id: 'c1',
    name: 'Dr. Amir Saleh',
    initials: 'AS',
    clinic: 'Bright Smile Clinic',
    orderId: 'ND-2418',
    priority: 'action',
    unread: 2,
    bubbles: [
      {
        id: 'c1-b1',
        author: 'them',
        text: {
          en: 'Here are the try-in photos for ND-2418.',
          he: 'הנה תמונות המדידה עבור ND-2418.',
        },
        attachment: { id: 'c1-a1', name: 'shade_A2_tryin.jpg', kind: 'image' },
        at: minutesAgo(6),
      },
      {
        id: 'c1-b2',
        author: 'them',
        text: {
          en: 'The shade on ND-2418 looks a touch light in the photos — can we warm it up?',
          he: 'הגוון של ND-2418 נראה מעט בהיר מדי בתמונות — אפשר לחמם אותו?',
        },
        at: minutesAgo(2),
      },
    ],
  },
  {
    id: 'c2',
    name: 'Dr. Rana Odeh',
    initials: 'RO',
    clinic: 'Dentaris Center',
    orderId: 'ND-2417',
    priority: 'high',
    unread: 2,
    bubbles: [
      {
        id: 'c2-b1',
        author: 'them',
        text: {
          en: 'New STL scan uploaded for the full arch case.',
          he: 'הועלתה סריקת STL חדשה לתיק הקשת המלאה.',
        },
        attachment: { id: 'c2-a1', name: 'ND-2417_upper.stl', kind: 'scan' },
        at: minutesAgo(20),
      },
      {
        id: 'c2-b2',
        author: 'them',
        text: {
          en: 'Please confirm you can open it.',
          he: 'אנא אשרו שניתן לפתוח אותה.',
        },
        at: minutesAgo(18),
      },
    ],
  },
  {
    id: 'c3',
    name: { en: 'Courier — Sami', he: 'שליח — סמי' },
    initials: 'CS',
    clinic: { en: 'Logistics', he: 'לוגיסטיקה' },
    priority: 'normal',
    unread: 0,
    bubbles: [
      {
        id: 'c3-b1',
        author: 'them',
        text: {
          en: 'Pickup completed at Peak Dental Studio, 4 impressions collected.',
          he: 'האיסוף הושלם ב-Peak Dental Studio, נאספו 4 הטבעות.',
        },
        at: minutesAgo(64),
      },
    ],
  },
  {
    id: 'c4',
    name: 'Dr. Lina Farah',
    initials: 'LF',
    clinic: 'Peak Dental Studio',
    orderId: 'ND-2412',
    priority: 'normal',
    unread: 0,
    bubbles: [
      {
        id: 'c4-b1',
        author: 'me',
        text: {
          en: 'Your night guard is ready and out for delivery.',
          he: 'סד הלילה שלך מוכן ויצא למשלוח.',
        },
        at: minutesAgo(1500),
      },
      {
        id: 'c4-b2',
        author: 'them',
        text: {
          en: 'Thanks for the fast turnaround on the night guard, patient is happy.',
          he: 'תודה על הזמן המהיר בסד הלילה, המטופל מרוצה.',
        },
        at: minutesAgo(1440),
      },
    ],
  },
  {
    id: 'c5',
    name: { en: 'Accounts', he: 'הנהלת חשבונות' },
    initials: 'AC',
    clinic: 'Nadeem Dental Lab',
    priority: 'high',
    unread: 0,
    bubbles: [
      {
        id: 'c5-b1',
        author: 'them',
        text: {
          en: 'Invoice #4471 for Dentaris Center is now 12 days overdue.',
          he: 'חשבונית #4471 עבור Dentaris Center באיחור של 12 ימים.',
        },
        at: minutesAgo(1460),
      },
    ],
  },
  {
    id: 'support',
    name: { en: 'Nadeem Lab support', he: 'תמיכת מעבדת נדים' },
    initials: 'NS',
    clinic: 'Nadeem Dental Lab',
    priority: 'normal',
    support: true,
    unread: 0,
    bubbles: [
      {
        id: 'support-b1',
        author: 'them',
        text: {
          en: 'Hi! The lab support team is here to help. How can we assist you today?',
          he: 'שלום! צוות התמיכה של המעבדה כאן כדי לעזור. איך נוכל לסייע היום?',
        },
        at: minutesAgo(2880),
      },
    ],
  },
];

const store = createStore<{ conversations: Conversation[] }>({ conversations: SEED });

/** Newest activity first; a thread with no bubbles yet sinks to the bottom. */
function lastActivity(conversation: Conversation): number {
  const last = conversation.bubbles[conversation.bubbles.length - 1];
  return last ? new Date(last.at).getTime() : 0;
}

function persist(conversations: Conversation[]) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function useChat() {
  const { conversations } = store.use();

  return useMemo(() => {
    const sorted = [...conversations].sort((a, b) => lastActivity(b) - lastActivity(a));
    return {
      conversations: sorted,
      unread: sorted.reduce((count, conversation) => count + conversation.unread, 0),
    };
  }, [conversations]);
}

export function useConversation(id?: string) {
  const { conversations } = store.use();
  return useMemo(() => conversations.find((conversation) => conversation.id === id), [conversations, id]);
}

export function sendMessage(
  conversationId: string,
  text: string,
  attachment?: Omit<ChatAttachment, 'id'>
) {
  const trimmed = text.trim();
  if (!trimmed && !attachment) return;

  store.set((prev) => {
    const conversations = prev.conversations.map((conversation) => {
      if (conversation.id !== conversationId) return conversation;
      const bubble: ChatBubble = {
        id: `${conversationId}-${Date.now()}`,
        author: 'me',
        text: trimmed || undefined,
        attachment: attachment
          ? { ...attachment, id: `${conversationId}-att-${Date.now()}` }
          : undefined,
        at: new Date().toISOString(),
      };
      return { ...conversation, bubbles: [...conversation.bubbles, bubble] };
    });
    persist(conversations);
    return { conversations };
  });
}

export function markConversationRead(conversationId: string) {
  store.set((prev) => {
    let changed = false;
    const conversations = prev.conversations.map((conversation) => {
      if (conversation.id !== conversationId || conversation.unread === 0) return conversation;
      changed = true;
      return { ...conversation, unread: 0 };
    });
    if (changed) persist(conversations);
    return { conversations };
  });
}

/** Opens a brand-new thread and returns its id so the caller can navigate to it. */
export function startConversation(input: {
  name: string;
  clinic?: string;
  orderId?: string;
  firstMessage: string;
}): string {
  const id = `c-${Date.now()}`;
  const parts = input.name
    .replace(/^(Dr|Dr\.)\s+/i, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials =
    parts.length === 0
      ? '?'
      : parts.length === 1
        ? parts[0].slice(0, 2).toUpperCase()
        : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

  store.set((prev) => {
    const conversation: Conversation = {
      id,
      name: input.name.trim(),
      initials,
      clinic: input.clinic?.trim() || '',
      orderId: input.orderId,
      priority: 'normal',
      unread: 0,
      bubbles: [
        {
          id: `${id}-b1`,
          author: 'me',
          text: input.firstMessage.trim(),
          at: new Date().toISOString(),
        },
      ],
    };
    const conversations = [conversation, ...prev.conversations];
    persist(conversations);
    return { conversations };
  });

  return id;
}

export async function hydrateChat() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Conversation[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      store.set({ conversations: parsed });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
