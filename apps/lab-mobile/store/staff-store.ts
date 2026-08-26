import AsyncStorage from '@react-native-async-storage/async-storage';

import type { MaybeLocalized } from '@/lib/i18n';
import type { PermissionOverrides, UserRole } from '@/lib/roles';
import { createStore } from '@/lib/store';

/** Doctors are clients, not employees, so they never appear on the roster. */
export type StaffRole = Extract<UserRole, 'lab_owner' | 'lab_staff' | 'driver'>;

export type StaffMember = {
  id: string;
  name: string;
  /** Seeded rows ship all three languages; owner-typed titles are plain strings. */
  title: MaybeLocalized;
  phone: string;
  email: string;
  role: StaffRole;
  permissions: PermissionOverrides;
  /** Roster swatch, also used for the avatar. */
  color: string;
  active: boolean;
};

/** Swatches that stay readable on both the white and the slate canvas. */
export const STAFF_COLORS = [
  '#8A6E62',
  '#2B3D4F',
  '#3F8A6E',
  '#B4822F',
  '#C25B54',
  '#5B7BE0',
  '#9D5BD2',
  '#2F8FBF',
] as const;

const STORAGE_KEY = 'lab-mobile:staff';

const SEED: StaffMember[] = [
  {
    id: 'st-1',
    name: 'Nadeem Younis',
    title: { en: 'Lab owner', he: 'בעל המעבדה', ar: 'مالك المختبر' },
    phone: '1',
    email: 'nadeem@nadeemlab.com',
    role: 'lab_owner',
    permissions: {},
    color: '#8A6E62',
    active: true,
  },
  {
    id: 'st-2',
    name: 'Karim Haddad',
    title: { en: 'CAD/CAM technician', he: 'טכנאי CAD/CAM', ar: 'فني CAD/CAM' },
    phone: '2',
    email: 'karim@nadeemlab.com',
    role: 'lab_staff',
    permissions: { viewDoctors: true },
    color: '#2B3D4F',
    active: true,
  },
  {
    id: 'st-3',
    name: 'Rania Kassab',
    title: { en: 'Ceramist', he: 'קרמיסטית', ar: 'أخصائية سيراميك' },
    phone: '5',
    email: 'rania@nadeemlab.com',
    role: 'lab_staff',
    permissions: { viewFiles: false },
    color: '#3F8A6E',
    active: true,
  },
  {
    id: 'st-4',
    name: 'Tarek Aziz',
    title: { en: 'Quality control', he: 'בקרת איכות', ar: 'مراقبة الجودة' },
    phone: '6',
    email: 'tarek@nadeemlab.com',
    role: 'lab_staff',
    permissions: { viewClinics: true, viewPatients: true },
    color: '#B4822F',
    active: true,
  },
  {
    id: 'st-5',
    name: 'Sami Nasser',
    title: { en: 'Courier', he: 'שליח', ar: 'مندوب توصيل' },
    phone: '4',
    email: 'sami@nadeemlab.com',
    role: 'driver',
    permissions: {},
    color: '#5B7BE0',
    active: true,
  },
  {
    id: 'st-6',
    name: 'Dina Barakat',
    title: { en: 'Model & dies', he: 'מודלים ודייז', ar: 'النماذج والقوالب' },
    phone: '7',
    email: 'dina@nadeemlab.com',
    role: 'lab_staff',
    permissions: {},
    color: '#9D5BD2',
    active: false,
  },
];

const store = createStore<{ members: StaffMember[] }>({ members: SEED });

export const useStaff = store.use;

export function staffMember(id: string | undefined): StaffMember | undefined {
  if (!id) return undefined;
  return store.get().members.find((member) => member.id === id);
}

/** The owner seat is structural: it can be edited but never removed or demoted. */
export function isOwnerSeat(member: StaffMember): boolean {
  return member.role === 'lab_owner';
}

function persist(members: StaffMember[]) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(members));
}

export function saveStaffMember(member: StaffMember) {
  store.set((prev) => {
    const exists = prev.members.some((row) => row.id === member.id);
    const members = exists
      ? prev.members.map((row) => (row.id === member.id ? member : row))
      : [...prev.members, member];
    persist(members);
    return { ...prev, members };
  });
}

export function removeStaffMember(id: string) {
  store.set((prev) => {
    const target = prev.members.find((row) => row.id === id);
    if (!target || isOwnerSeat(target)) return prev;
    const members = prev.members.filter((row) => row.id !== id);
    persist(members);
    return { ...prev, members };
  });
}

export function createStaffMember(): StaffMember {
  const used = new Set(store.get().members.map((member) => member.color));
  return {
    id: `st-${Date.now().toString(36)}`,
    name: '',
    title: '',
    phone: '',
    email: '',
    role: 'lab_staff',
    permissions: {},
    color: STAFF_COLORS.find((color) => !used.has(color)) ?? STAFF_COLORS[0],
    active: true,
  };
}

export async function hydrateStaff() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as StaffMember[];
    // An empty roster would lock the owner out of staff management.
    if (Array.isArray(parsed) && parsed.length > 0) {
      store.set({ members: parsed });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
