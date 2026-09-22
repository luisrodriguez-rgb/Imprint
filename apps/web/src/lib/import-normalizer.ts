import { LedgerEvent, ProviderId, ActivityCategory, ActivityTag } from '@imprint/schemas';
import { estimateImpact, getMethodology } from '@imprint/impact-engine';

export interface ImportStats {
  totalEvents: number;
  providerCounts: Record<string, number>;
  totalTokens: number;
  modelsDetected: string[];
  appliedMethodology: string;
  earliestDate: Date | null;
  latestDate: Date | null;
}

export interface NormalizationResult {
  events: LedgerEvent[];
  stats: ImportStats;
}

/**
 * Normalizes provider name from loose string to valid Imprint ProviderId
 */
function normalizeProvider(raw: any): ProviderId {
  if (typeof raw !== 'string') return 'other';
  const str = raw.toLowerCase().trim();
  if (str.includes('chatgpt') || str.includes('openai') || str.includes('gpt')) return 'chatgpt';
  if (str.includes('claude') || str.includes('anthropic')) return 'claude';
  if (str.includes('gemini') || str.includes('google')) return 'gemini';
  if (str.includes('grok') || str.includes('xai')) return 'grok';
  return 'other';
}

/**
 * Normalizes activity category from loose string or object
 */
function normalizeActivity(raw: any): ActivityTag {
  const validCategories: ActivityCategory[] = [
    'study',
    'coding',
    'research',
    'writing',
    'work',
    'entertainment',
    'other',
    'unknown',
  ];

  if (typeof raw === 'string') {
    const clean = raw.toLowerCase().trim() as ActivityCategory;
    if (validCategories.includes(clean)) {
      return { category: clean, source: 'manual' };
    }
  } else if (typeof raw === 'object' && raw !== null && raw.category) {
    const clean = String(raw.category).toLowerCase().trim() as ActivityCategory;
    if (validCategories.includes(clean)) {
      return { category: clean, source: raw.source || 'manual', label: raw.label };
    }
  }

  return { category: 'study', source: 'heuristic' };
}

/**
 * Infers model family from raw model name or provider
 */
function inferModelFamily(modelRaw: string | null | undefined, provider: ProviderId): string {
  if (!modelRaw) {
    if (provider === 'chatgpt') return 'gpt-4o';
    if (provider === 'claude') return 'claude-3-7-sonnet';
    if (provider === 'gemini') return 'gemini-2-flash';
    if (provider === 'grok') return 'grok-3';
    return 'other';
  }

  const str = modelRaw.toLowerCase();
  if (str.includes('o3') || str.includes('o-3')) return 'o3-mini';
  if (str.includes('o1') || str.includes('o-1')) return 'o1';
  if (str.includes('gpt-4o') || str.includes('4o')) return 'gpt-4o';
  if (str.includes('claude-3-7') || str.includes('3.7')) return 'claude-3-7-sonnet';
  if (str.includes('claude-3-5') || str.includes('3.5')) return 'claude-3-5-sonnet';
  if (str.includes('gemini-2') && str.includes('pro')) return 'gemini-2-pro';
  if (str.includes('gemini-2') || str.includes('flash')) return 'gemini-2-flash';
  if (str.includes('grok-3')) return 'grok-3';
  if (str.includes('grok-2')) return 'grok-2';
  return 'other';
}

/**
 * Robust normalizer for incoming JSON telemetry exports.
 * Transforms partial, legacy, or database exports into fully verified, schema-conforming LedgerEvents.
 */
export function normalizeLedgerImport(
  rawInput: unknown,
  activeMethodologyId = 'joule-frontier-2026'
): NormalizationResult {
  let items: any[] = [];

  if (Array.isArray(rawInput)) {
    items = rawInput;
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    const obj = rawInput as any;
    if (Array.isArray(obj.events)) items = obj.events;
    else if (Array.isArray(obj.ledger)) items = obj.ledger;
    else if (Array.isArray(obj.records)) items = obj.records;
    else if (Array.isArray(obj.data)) items = obj.data;
    else if (Array.isArray(obj.turns)) items = obj.turns;
    else items = [obj]; // Single turn object
  } else {
    throw new Error('Import data must be a valid JSON array or object containing ledger events.');
  }

  if (items.length === 0) {
    throw new Error('Ledger export contains 0 interaction records.');
  }

  const methodology = getMethodology(activeMethodologyId);
  const normalizedEvents: LedgerEvent[] = [];
  const providerCounts: Record<string, number> = {};
  const modelSet = new Set<string>();
  let totalTokens = 0;
  let minEpoch = Infinity;
  let maxEpoch = -Infinity;

  items.forEach((item, index) => {
    // 1. Monotonic ID fallback
    const id = typeof item.id === 'string' && item.id.trim()
      ? item.id
      : `evt-imp-${Date.now()}-${index + 1}`;

    // 2. Timestamp normalization
    let epochMs = Date.now();
    if (typeof item.timestamp === 'number' && !isNaN(item.timestamp)) {
      epochMs = item.timestamp;
    } else if (typeof item.timestamp === 'string') {
      const parsed = Date.parse(item.timestamp);
      if (!isNaN(parsed)) epochMs = parsed;
    } else if (typeof item.date === 'string') {
      const parsed = Date.parse(item.date);
      if (!isNaN(parsed)) epochMs = parsed;
    }

    if (epochMs < minEpoch) minEpoch = epochMs;
    if (epochMs > maxEpoch) maxEpoch = epochMs;

    // 3. Provider & Model
    const provider = normalizeProvider(item.provider);
    providerCounts[provider] = (providerCounts[provider] || 0) + 1;

    const modelRaw = item.modelRaw || item.model || item.model_raw || null;
    const modelFamily = item.modelFamily || item.model_family || inferModelFamily(modelRaw, provider);
    if (modelRaw) modelSet.add(modelRaw);
    else modelSet.add(modelFamily);

    // 4. Session & Turn
    const sessionId = typeof item.sessionId === 'string' && item.sessionId
      ? item.sessionId
      : `session-${new Date(epochMs).toISOString().slice(0, 10)}`;
    const interactionIndex = typeof item.interactionIndex === 'number' && item.interactionIndex > 0
      ? item.interactionIndex
      : (index % 5) + 1;

    // 5. Token counters
    const inTokens = Math.max(
      1,
      typeof item.input?.estimatedTokens === 'number'
        ? item.input.estimatedTokens
        : typeof item.inputTokens === 'number'
        ? item.inputTokens
        : typeof item.input_tokens === 'number'
        ? item.input_tokens
        : 120
    );

    const outTokens = Math.max(
      1,
      typeof item.output?.estimatedTokens === 'number'
        ? item.output.estimatedTokens
        : typeof item.outputTokens === 'number'
        ? item.outputTokens
        : typeof item.output_tokens === 'number'
        ? item.output_tokens
        : 350
    );

    const reasonTokens = Math.max(
      0,
      typeof item.output?.reasoningTokens === 'number'
        ? item.output.reasoningTokens
        : typeof item.reasoningTokens === 'number'
        ? item.reasoningTokens
        : typeof item.reasoning_tokens === 'number'
        ? item.reasoning_tokens
        : 0
    );

    totalTokens += inTokens + outTokens + reasonTokens;

    // 6. Impact calculation using active methodology to ensure complete reproducibility
    const calc = estimateImpact({
      inputTokens: inTokens,
      outputTokens: outTokens,
      reasoningTokens: reasonTokens,
      modelFamily,
      providerId: provider,
      methodologyId: activeMethodologyId,
      inputProvenance: item.input?.provenance || 'local_estimation',
      outputProvenance: item.output?.provenance || 'browser_observation',
      modelDetected: modelRaw !== null,
    });

    const event: LedgerEvent = {
      id,
      timestamp: epochMs,
      provider,
      modelRaw,
      modelFamily,
      sessionId,
      interactionIndex,
      durationMs: typeof item.durationMs === 'number' ? item.durationMs : 2500,
      input: {
        charCount: item.input?.charCount ?? inTokens * 4,
        wordCount: item.input?.wordCount ?? Math.round(inTokens * 0.75),
        estimatedTokens: inTokens,
        modality: 'text',
        provenance: item.input?.provenance || 'local_estimation',
      },
      output: {
        charCount: item.output?.charCount ?? outTokens * 4,
        wordCount: item.output?.wordCount ?? Math.round(outTokens * 0.75),
        estimatedTokens: outTokens,
        reasoningTokens: reasonTokens,
        modality: 'text',
        provenance: item.output?.provenance || 'browser_observation',
      },
      activity: normalizeActivity(item.activity),
      impact: calc.impact,
      confidence: calc.confidence,
    };

    normalizedEvents.push(event);
  });

  return {
    events: normalizedEvents,
    stats: {
      totalEvents: normalizedEvents.length,
      providerCounts,
      totalTokens,
      modelsDetected: Array.from(modelSet),
      appliedMethodology: methodology.name,
      earliestDate: minEpoch !== Infinity ? new Date(minEpoch) : null,
      latestDate: maxEpoch !== -Infinity ? new Date(maxEpoch) : null,
    },
  };
}
