import { useSyncExternalStore } from 'react';

export type Store<T> = {
  get: () => T;
  set: (patch: Partial<T> | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  use: () => T;
};

/**
 * Minimal external store built on `useSyncExternalStore`. State is replaced (never
 * mutated) so the snapshot reference stays stable between renders.
 */
export function createStore<T extends object>(initialState: T): Store<T> {
  let state = initialState;
  const listeners = new Set<() => void>();

  const get = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const set: Store<T>['set'] = (patch) => {
    state = typeof patch === 'function' ? patch(state) : { ...state, ...patch };
    listeners.forEach((listener) => listener());
  };

  return {
    get,
    set,
    subscribe,
    use: () => useSyncExternalStore(subscribe, get, get),
  };
}
