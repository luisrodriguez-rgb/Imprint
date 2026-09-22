import { LedgerEvent, ActivityCategory, ProviderId } from '@imprint/schemas';
import { estimateImpact } from '@imprint/impact-engine';

interface TurnSeed {
  provider: ProviderId;
  modelRaw: string;
  modelFamily: string;
  activity: ActivityCategory;
  inTok: number;
  outTok: number;
  reasonTok: number;
  hoursAgo: number;
  sessionId: string;
}

const SEED_TURNS: TurnSeed[] = [
  // Today's turns
  { provider: 'claude', modelRaw: 'Claude 3.7 Sonnet', modelFamily: 'claude-3-7-sonnet', activity: 'coding', inTok: 320, outTok: 940, reasonTok: 1200, hoursAgo: 1.2, sessionId: 'claude-proj-refactor' },
  { provider: 'claude', modelRaw: 'Claude 3.7 Sonnet', modelFamily: 'claude-3-7-sonnet', activity: 'coding', inTok: 280, outTok: 620, reasonTok: 800, hoursAgo: 1.8, sessionId: 'claude-proj-refactor' },
  { provider: 'chatgpt', modelRaw: 'GPT-4o', modelFamily: 'gpt-4o', activity: 'research', inTok: 180, outTok: 450, reasonTok: 0, hoursAgo: 3.5, sessionId: 'chatgpt-climate-metrics' },
  { provider: 'chatgpt', modelRaw: 'GPT-4o', modelFamily: 'gpt-4o', activity: 'research', inTok: 210, outTok: 510, reasonTok: 0, hoursAgo: 4.0, sessionId: 'chatgpt-climate-metrics' },
  { provider: 'gemini', modelRaw: 'Gemini 2.0 Flash', modelFamily: 'gemini-2-flash', activity: 'writing', inTok: 420, outTok: 780, reasonTok: 0, hoursAgo: 5.2, sessionId: 'gemini-draft-brief' },
  { provider: 'gemini', modelRaw: 'Gemini 2.0 Flash', modelFamily: 'gemini-2-flash', activity: 'writing', inTok: 310, outTok: 490, reasonTok: 0, hoursAgo: 5.6, sessionId: 'gemini-draft-brief' },
  
  // Yesterday
  { provider: 'grok', modelRaw: 'Grok 3 Think', modelFamily: 'grok-3', activity: 'study', inTok: 250, outTok: 850, reasonTok: 1500, hoursAgo: 22.0, sessionId: 'grok-thermodynamics' },
  { provider: 'grok', modelRaw: 'Grok 3 Think', modelFamily: 'grok-3', activity: 'study', inTok: 190, outTok: 680, reasonTok: 1100, hoursAgo: 22.5, sessionId: 'grok-thermodynamics' },
  { provider: 'claude', modelRaw: 'Claude 3.5 Sonnet', modelFamily: 'claude-3-5-sonnet', activity: 'coding', inTok: 450, outTok: 1100, reasonTok: 0, hoursAgo: 25.0, sessionId: 'claude-arch-design' },
  { provider: 'chatgpt', modelRaw: 'o3-mini', modelFamily: 'o3-mini', activity: 'coding', inTok: 320, outTok: 740, reasonTok: 1800, hoursAgo: 27.5, sessionId: 'chatgpt-algorithm-opt' },
  { provider: 'chatgpt', modelRaw: 'o3-mini', modelFamily: 'o3-mini', activity: 'coding', inTok: 290, outTok: 630, reasonTok: 1400, hoursAgo: 28.0, sessionId: 'chatgpt-algorithm-opt' },

  // 2 days ago
  { provider: 'gemini', modelRaw: 'Gemini 2.0 Pro', modelFamily: 'gemini-2-pro', activity: 'research', inTok: 580, outTok: 980, reasonTok: 950, hoursAgo: 48.0, sessionId: 'gemini-datacenter-study' },
  { provider: 'gemini', modelRaw: 'Gemini 2.0 Pro', modelFamily: 'gemini-2-pro', activity: 'research', inTok: 420, outTok: 810, reasonTok: 600, hoursAgo: 49.0, sessionId: 'gemini-datacenter-study' },
  { provider: 'chatgpt', modelRaw: 'GPT-4o', modelFamily: 'gpt-4o', activity: 'work', inTok: 160, outTok: 390, reasonTok: 0, hoursAgo: 51.5, sessionId: 'chatgpt-quarterly-plan' },
  { provider: 'chatgpt', modelRaw: 'GPT-4o', modelFamily: 'gpt-4o', activity: 'work', inTok: 220, outTok: 430, reasonTok: 0, hoursAgo: 52.0, sessionId: 'chatgpt-quarterly-plan' },
  { provider: 'claude', modelRaw: 'Claude 3.7 Sonnet', modelFamily: 'claude-3-7-sonnet', activity: 'writing', inTok: 340, outTok: 720, reasonTok: 500, hoursAgo: 54.0, sessionId: 'claude-essay-revision' },

  // 3 days ago
  { provider: 'grok', modelRaw: 'Grok 2', modelFamily: 'grok-2', activity: 'entertainment', inTok: 110, outTok: 320, reasonTok: 0, hoursAgo: 72.0, sessionId: 'grok-trivia-session' },
  { provider: 'chatgpt', modelRaw: 'GPT-4o', modelFamily: 'gpt-4o', activity: 'study', inTok: 280, outTok: 590, reasonTok: 0, hoursAgo: 74.0, sessionId: 'chatgpt-linear-algebra' },
  { provider: 'claude', modelRaw: 'Claude 3.5 Sonnet', modelFamily: 'claude-3-5-sonnet', activity: 'coding', inTok: 390, outTok: 870, reasonTok: 0, hoursAgo: 76.5, sessionId: 'claude-api-migration' },

  // 4 days ago
  { provider: 'chatgpt', modelRaw: 'o3-mini', modelFamily: 'o3-mini', activity: 'coding', inTok: 410, outTok: 890, reasonTok: 2100, hoursAgo: 98.0, sessionId: 'chatgpt-compiler-parser' },
  { provider: 'gemini', modelRaw: 'Gemini 2.0 Flash', modelFamily: 'gemini-2-flash', activity: 'research', inTok: 340, outTok: 610, reasonTok: 0, hoursAgo: 101.0, sessionId: 'gemini-hardware-cooling' },
  { provider: 'claude', modelRaw: 'Claude 3.7 Sonnet', modelFamily: 'claude-3-7-sonnet', activity: 'writing', inTok: 290, outTok: 680, reasonTok: 450, hoursAgo: 103.0, sessionId: 'claude-newsletter-draft' },
];

export function generateSeedLedgerEvents(methodologyId = 'joule-frontier-2026'): LedgerEvent[] {
  const now = Date.now();

  return SEED_TURNS.map((seed, index) => {
    const timestamp = now - seed.hoursAgo * 3600 * 1000;
    const calc = estimateImpact({
      inputTokens: seed.inTok,
      outputTokens: seed.outTok,
      reasoningTokens: seed.reasonTok,
      modelFamily: seed.modelFamily,
      providerId: seed.provider,
      methodologyId,
      inputProvenance: 'local_estimation',
      outputProvenance: 'browser_observation',
      modelDetected: true,
    });

    return {
      id: `evt-seed-${index + 1}`,
      timestamp,
      provider: seed.provider,
      modelRaw: seed.modelRaw,
      modelFamily: seed.modelFamily,
      sessionId: seed.sessionId,
      interactionIndex: (index % 3) + 1,
      durationMs: 2000 + (seed.reasonTok > 0 ? 4500 : 1200),
      input: {
        charCount: seed.inTok * 4,
        wordCount: Math.round(seed.inTok * 0.75),
        estimatedTokens: seed.inTok,
        modality: 'text',
        provenance: 'local_estimation',
      },
      output: {
        charCount: seed.outTok * 4,
        wordCount: Math.round(seed.outTok * 0.75),
        estimatedTokens: seed.outTok,
        reasoningTokens: seed.reasonTok,
        modality: 'text',
        provenance: 'browser_observation',
      },
      activity: {
        category: seed.activity,
        source: 'manual',
      },
      impact: calc.impact,
      confidence: calc.confidence,
    };
  });
}
