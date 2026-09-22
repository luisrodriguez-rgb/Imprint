import {
  LedgerEvent,
  LedgerSessionSummary,
  ProviderId,
  MetricValue,
  ConfidenceLevel,
} from '@imprint/schemas';

const STORAGE_KEY_EVENTS = 'imprint_ledger_events';
const STORAGE_KEY_SETTINGS = 'imprint_settings';

export interface ImprintSettings {
  activeMethodologyId: string;
  offlineOnly: boolean;
  gridCarbonIntensity: number;
}

export const DEFAULT_SETTINGS: ImprintSettings = {
  activeMethodologyId: 'joule-frontier-2026',
  offlineOnly: true,
  gridCarbonIntensity: 380,
};

// Safe storage wrapper supporting chrome.storage.local, browser.storage.local, or memory fallback
async function getStorageItem<T>(key: string, defaultValue: T): Promise<T> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError || !result[key]) {
          resolve(defaultValue);
        } else {
          resolve(result[key]);
        }
      });
    });
  }

  if (typeof localStorage !== 'undefined') {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  return defaultValue;
}

async function setStorageItem<T>(key: string, value: T): Promise<void> {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    });
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export async function getLedgerEvents(): Promise<LedgerEvent[]> {
  return getStorageItem<LedgerEvent[]>(STORAGE_KEY_EVENTS, []);
}

export async function appendLedgerEvent(event: LedgerEvent): Promise<void> {
  const events = await getLedgerEvents();
  // Store up to 1,000 most recent events locally
  const updated = [event, ...events].slice(0, 1000);
  await setStorageItem(STORAGE_KEY_EVENTS, updated);
}

export async function getSettings(): Promise<ImprintSettings> {
  return getStorageItem<ImprintSettings>(STORAGE_KEY_SETTINGS, DEFAULT_SETTINGS);
}

export async function updateSettings(settings: Partial<ImprintSettings>): Promise<ImprintSettings> {
  const current = await getSettings();
  const merged = { ...current, ...settings };
  await setStorageItem(STORAGE_KEY_SETTINGS, merged);
  return merged;
}

export async function clearLedger(): Promise<void> {
  await setStorageItem(STORAGE_KEY_EVENTS, []);
}

/**
 * Calculates current session or today's aggregated metrics from raw events
 */
export function aggregateSessionSummary(
  events: LedgerEvent[],
  sessionId?: string
): LedgerSessionSummary | null {
  const filtered = sessionId
    ? events.filter((e) => e.sessionId === sessionId)
    : events;

  if (filtered.length === 0) return null;

  const first = filtered[filtered.length - 1];
  const last = filtered[0];

  let totalEnergyExpected = 0;
  let totalEnergyMin = 0;
  let totalEnergyMax = 0;

  let totalWaterExpected = 0;
  let totalWaterMin = 0;
  let totalWaterMax = 0;

  let totalCarbonExpected = 0;
  let totalCarbonMin = 0;
  let totalCarbonMax = 0;

  let totalInTokens = 0;
  let totalOutTokens = 0;

  for (const ev of filtered) {
    totalInTokens += ev.input.estimatedTokens;
    totalOutTokens += ev.output.estimatedTokens;

    totalEnergyExpected += ev.impact.energy.total.expected;
    totalEnergyMin += ev.impact.energy.total.min;
    totalEnergyMax += ev.impact.energy.total.max;

    totalWaterExpected += ev.impact.water.consumption.total.expected;
    totalWaterMin += ev.impact.water.consumption.total.min;
    totalWaterMax += ev.impact.water.consumption.total.max;

    totalCarbonExpected += ev.impact.carbon.total.expected;
    totalCarbonMin += ev.impact.carbon.total.min;
    totalCarbonMax += ev.impact.carbon.total.max;
  }

  const round = (n: number) => Math.round(n * 100) / 100;

  const totalEnergyWh: MetricValue = {
    min: round(totalEnergyMin),
    expected: round(totalEnergyExpected),
    max: round(totalEnergyMax),
    unit: 'Wh',
    provenance: 'methodology_model',
    scope: 'datacenter',
  };

  const totalWaterConsumptionMl: MetricValue = {
    min: round(totalWaterMin),
    expected: round(totalWaterExpected),
    max: round(totalWaterMax),
    unit: 'mL',
    provenance: 'methodology_model',
    scope: 'grid',
  };

  const totalCarbonG: MetricValue = {
    min: round(totalCarbonMin),
    expected: round(totalCarbonExpected),
    max: round(totalCarbonMax),
    unit: 'g CO2e',
    provenance: 'methodology_model',
    scope: 'grid',
  };

  return {
    sessionId: sessionId || 'all-recent',
    provider: (last.provider as ProviderId) || 'chatgpt',
    startTime: first.timestamp,
    endTime: last.timestamp,
    interactionCount: filtered.length,
    totalInputTokens: totalInTokens,
    totalOutputTokens: totalOutTokens,
    totalEnergyWh,
    totalWaterConsumptionMl,
    totalCarbonG,
    confidence: last.confidence.level as ConfidenceLevel,
    primaryActivity: last.activity.category,
  };
}
