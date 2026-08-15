import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStore } from '@/lib/store';

export type UserRole = 'lab_admin' | 'doctor' | 'clinic';

export type AuthUser = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  role: UserRole;
  labName: string;
};

type AuthState = {
  user: AuthUser | null;
  pendingPhone: string | null;
  hydrated: boolean;
};

export const DEMO_PHONE = '1';
export const DEMO_PASSWORD = '0000';
export const DEMO_OTP = '1234';

const STORAGE_KEY = 'lab-mobile:session';
/** Fake network delay so buttons show real pending states. */
const LATENCY_MS = 550;

const DEMO_USER: AuthUser = {
  id: 'demo-lab-admin',
  name: 'Dr. Nadeem Younis',
  initials: 'NY',
  phone: DEMO_PHONE,
  role: 'lab_admin',
  labName: 'Nadeem Dental Lab',
};

const store = createStore<AuthState>({ user: null, pendingPhone: null, hydrated: false });

export const useAuth = store.use;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Screens translate these codes, so errors follow the selected language. */
export type AuthErrorCode = 'credentials' | 'expired' | 'code';
export type AuthResult = { ok: true } | { ok: false; error: AuthErrorCode };

export async function requestOtp(phone: string, password: string): Promise<AuthResult> {
  await wait(LATENCY_MS);
  const normalizedPhone = phone.replace(/\D/g, '');
  if (normalizedPhone !== DEMO_PHONE || password !== DEMO_PASSWORD) {
    return { ok: false, error: 'credentials' };
  }
  store.set({ pendingPhone: normalizedPhone });
  return { ok: true };
}

export async function verifyOtp(code: string): Promise<AuthResult> {
  await wait(LATENCY_MS);
  if (!store.get().pendingPhone) {
    return { ok: false, error: 'expired' };
  }
  if (code !== DEMO_OTP) {
    return { ok: false, error: 'code' };
  }
  const user = { ...DEMO_USER, phone: store.get().pendingPhone ?? DEMO_PHONE };
  store.set({ user, pendingPhone: null });
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
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
      store.set({ user: JSON.parse(saved) as AuthUser });
    }
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } finally {
    store.set({ hydrated: true });
  }
}
