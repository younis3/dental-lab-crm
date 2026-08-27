import AsyncStorage from '@react-native-async-storage/async-storage';

import { createStore } from '@/lib/store';

const STORAGE_KEY = 'lab-mobile:order-capacity';

export const DEFAULT_CAPACITY = 35;
export const MIN_CAPACITY = 1;
export const MAX_CAPACITY = 999;

const store = createStore<{ capacity: number }>({ capacity: DEFAULT_CAPACITY });

export const useWorkPressure = store.use;

export function clampCapacity(value: number) {
  return Math.min(MAX_CAPACITY, Math.max(MIN_CAPACITY, Math.round(value)));
}

/** Open cases ÷ capacity. Can exceed 100 when the floor is overloaded. */
export function workPressurePercent(openOrders: number, capacity: number) {
  if (capacity <= 0) return 0;
  return Math.round((openOrders / capacity) * 100);
}

export function workPressureLevel(percent: number) {
  if (percent > 95) return 'danger' as const;
  if (percent > 75) return 'warning' as const;
  return 'ok' as const;
}

export function setOrderCapacity(capacity: number) {
  const next = clampCapacity(capacity);
  store.set({ capacity: next });
  void AsyncStorage.setItem(STORAGE_KEY, String(next));
}

export async function hydrateWorkPressure() {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  const parsed = Number(saved);
  if (Number.isFinite(parsed)) store.set({ capacity: clampCapacity(parsed) });
}
