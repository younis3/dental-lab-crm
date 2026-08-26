import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useMemo } from 'react';

import { createStore } from '@/lib/store';
import {
  effectivePermissions,
  type Permission,
  type PermissionOverrides,
  type UserRole,
} from '@/lib/roles';

export type { UserRole } from '@/lib/roles';

export type AuthUser = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  role: UserRole;
  labName: string;
  /** Owner-assigned deltas on top of the role baseline. */
  permissions?: PermissionOverrides;
};

type AuthState = {
  user: AuthUser | null;
  pendingPhone: string | null;
  hydrated: boolean;
};

export const DEMO_PASSWORD = '0000';
export const DEMO_OTP = '1234';

const LAB_NAME = 'Nadeem Dental Lab';

/** One demo login per role, keyed by the phone number typed on the sign-in screen. */
export const DEMO_ACCOUNTS: Record<string, AuthUser> = {
  '1': {
    id: 'u-owner',
    name: 'Nadeem Younis',
    initials: 'NY',
    phone: '1',
    role: 'lab_owner',
    labName: LAB_NAME,
  },
  '2': {
    id: 'u-tech',
    name: 'Karim Haddad',
    initials: 'KH',
    phone: '2',
    role: 'lab_staff',
    labName: LAB_NAME,
    permissions: { viewDoctors: true },
  },
  '3': {
    id: 'u-doctor',
    name: 'Dr. Amir Saleh',
    initials: 'AS',
    phone: '3',
    role: 'doctor',
    labName: LAB_NAME,
  },
  '4': {
    id: 'u-driver',
    name: 'Sami Nasser',
    initials: 'SN',
    phone: '4',
    role: 'driver',
    labName: LAB_NAME,
  },
};

/** Order the demo roles appear in on the sign-in screen. */
export const DEMO_ACCOUNT_PHONES: readonly string[] = ['1', '2', '3', '4'];

const STORAGE_KEY = 'lab-mobile:session';
/** Fake network delay so buttons show real pending states. */
const LATENCY_MS = 550;

const store = createStore<AuthState>({ user: null, pendingPhone: null, hydrated: false });

export const useAuth = store.use;

const NO_PERMISSIONS: ReadonlySet<Permission> = new Set();

/** Permission check bound to the signed-in user. */
export function usePermissions() {
  const { user } = store.use();
  const role = user?.role ?? null;
  const overrides = user?.permissions;

  const granted = useMemo(
    () => (role ? effectivePermissions(role, overrides) : NO_PERMISSIONS),
    [overrides, role]
  );

  const can = useCallback((permission: Permission) => granted.has(permission), [granted]);

  return { role, can };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

/** Screens translate these codes, so errors follow the selected language. */
export type AuthErrorCode = 'credentials' | 'expired' | 'code';
export type AuthResult = { ok: true } | { ok: false; error: AuthErrorCode };

export async function requestOtp(phone: string, password: string): Promise<AuthResult> {
  await wait(LATENCY_MS);
  const normalized = normalizePhone(phone);
  if (!DEMO_ACCOUNTS[normalized] || password !== DEMO_PASSWORD) {
    return { ok: false, error: 'credentials' };
  }
  store.set({ pendingPhone: normalized });
  return { ok: true };
}

export async function verifyOtp(code: string): Promise<AuthResult> {
  await wait(LATENCY_MS);
  const pendingPhone = store.get().pendingPhone;
  if (!pendingPhone) {
    return { ok: false, error: 'expired' };
  }
  if (code !== DEMO_OTP) {
    return { ok: false, error: 'code' };
  }
  const account = DEMO_ACCOUNTS[pendingPhone];
  if (!account) {
    return { ok: false, error: 'expired' };
  }
  store.set({ user: account, pendingPhone: null });
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  return { ok: true };
}

export function cancelOtp() {
  store.set({ pendingPhone: null });
}

export function logout() {
  store.set({ user: null, pendingPhone: null });
  void AsyncStorage.removeItem(STORAGE_KEY);
}

export async function hydrateAuth() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AuthUser;
      // Re-read the canonical record so edits to the demo roles land on an
      // already-signed-in session, and unknown accounts sign out.
      store.set({ user: DEMO_ACCOUNTS[normalizePhone(parsed.phone)] ?? null });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } finally {
    store.set({ hydrated: true });
  }
}
