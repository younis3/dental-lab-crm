import AsyncStorage from '@react-native-async-storage/async-storage';

import type { IconName } from '@/components/ui/icon';
import type { Tone } from '@/components/ui/pill';
import type { UiStrings } from '@/lib/i18n';
import { createStore } from '@/lib/store';

export type IntegrationId = 'shining3d' | 'anthropic' | 'cloud';

export type IntegrationField = {
  key: string;
  labelKey: keyof UiStrings;
  placeholderKey: keyof UiStrings;
  /** Rendered as a masked password field. */
  secret?: boolean;
};

export type IntegrationMeta = {
  id: IntegrationId;
  labelKey: keyof UiStrings;
  hintKey: keyof UiStrings;
  icon: IconName;
  tone: Tone;
  fields: IntegrationField[];
};

/**
 * The external services the lab can wire up. Values are stored per field key, so
 * adding a field never needs a schema change — only a new entry here.
 */
export const INTEGRATIONS: IntegrationMeta[] = [
  {
    id: 'shining3d',
    labelKey: 'integrationShining3d',
    hintKey: 'integrationShining3dHint',
    icon: 'cube-outline',
    tone: 'brand',
    fields: [
      {
        key: 'apiKey',
        labelKey: 'integrationFieldApiKey',
        placeholderKey: 'integrationFieldApiKeyPlaceholder',
        secret: true,
      },
      {
        key: 'accountId',
        labelKey: 'integrationFieldAccountId',
        placeholderKey: 'integrationFieldAccountIdPlaceholder',
      },
    ],
  },
  {
    id: 'anthropic',
    labelKey: 'integrationAnthropic',
    hintKey: 'integrationAnthropicHint',
    icon: 'sparkles-outline',
    tone: 'accent',
    fields: [
      {
        key: 'apiKey',
        labelKey: 'integrationFieldApiKey',
        placeholderKey: 'integrationFieldApiKeyPlaceholder',
        secret: true,
      },
      {
        key: 'model',
        labelKey: 'integrationFieldModel',
        placeholderKey: 'integrationFieldModelPlaceholder',
      },
    ],
  },
  {
    id: 'cloud',
    labelKey: 'integrationCloud',
    hintKey: 'integrationCloudHint',
    icon: 'cloud-outline',
    tone: 'success',
    fields: [
      {
        key: 'endpoint',
        labelKey: 'integrationFieldEndpoint',
        placeholderKey: 'integrationFieldEndpointPlaceholder',
      },
      {
        key: 'apiKey',
        labelKey: 'integrationFieldApiKey',
        placeholderKey: 'integrationFieldApiKeyPlaceholder',
        secret: true,
      },
    ],
  },
];

export type IntegrationState = {
  enabled: boolean;
  /** Field key → value. */
  values: Record<string, string>;
};

export type IntegrationsState = Record<IntegrationId, IntegrationState>;

/**
 * Seeded so the three status states are visible before any real setup:
 * `shining3d` is active, `anthropic` has keys but a failing health check
 * (see `DEMO_API_TEST_FAILING`), and `cloud` is still turned off.
 */
const EMPTY: IntegrationsState = {
  shining3d: { enabled: true, values: { apiKey: 'demo-key', accountId: 'lab-001' } },
  anthropic: { enabled: true, values: { apiKey: 'demo-key', model: 'claude-3-5-sonnet' } },
  cloud: { enabled: false, values: {} },
};

const STORAGE_KEY = 'lab-mobile:integrations:v2';

const store = createStore<IntegrationsState>(EMPTY);

function persist(state: IntegrationsState) {
  void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useIntegrations() {
  return store.use();
}

/** A provider counts as connected once it is enabled and holds at least one key. */
export function isConnected(state: IntegrationState): boolean {
  return state.enabled && Object.values(state.values).some((value) => value.trim().length > 0);
}

/**
 * `active` — keys are set and the API health check passes.
 * `disconnected` — keys are set but the API health check is failing.
 * `off` — no key yet, so the provider is turned off.
 */
export type IntegrationStatus = 'active' | 'disconnected' | 'off';

/**
 * Placeholder for the real per-provider API health checks that will land later.
 * Until then one provider is intentionally reported as failing so the
 * `disconnected` state is visible in the UI.
 */
const DEMO_API_TEST_FAILING: Partial<Record<IntegrationId, boolean>> = {
  anthropic: true,
};

export function isApiTestFailing(id: IntegrationId): boolean {
  return DEMO_API_TEST_FAILING[id] ?? false;
}

export function integrationStatus(id: IntegrationId, state: IntegrationState): IntegrationStatus {
  if (!isConnected(state)) return 'off';
  return isApiTestFailing(id) ? 'disconnected' : 'active';
}

export function saveIntegration(id: IntegrationId, next: IntegrationState) {
  store.set((prev) => {
    const cleaned: Record<string, string> = {};
    for (const [key, value] of Object.entries(next.values)) {
      const trimmed = value.trim();
      if (trimmed) cleaned[key] = trimmed;
    }
    const state = { ...prev, [id]: { enabled: next.enabled, values: cleaned } };
    persist(state);
    return state;
  });
}

export async function hydrateIntegrations() {
  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const parsed = JSON.parse(saved) as Partial<IntegrationsState>;
    store.set({
      shining3d: parsed.shining3d ?? EMPTY.shining3d,
      anthropic: parsed.anthropic ?? EMPTY.anthropic,
      cloud: parsed.cloud ?? EMPTY.cloud,
    });
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
}
