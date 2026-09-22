import { z } from 'zod';
import { DataProvenanceSchema } from './provenance';
import { ImpactResultSchema, MetricValueSchema } from './metrics';
import { ConfidenceAssessmentSchema, ConfidenceLevelSchema } from './confidence';

export const ProviderIdSchema = z.enum(['chatgpt', 'claude', 'gemini', 'grok', 'other']);
export type ProviderId = z.infer<typeof ProviderIdSchema>;

export const ActivityCategorySchema = z.enum([
  'study',
  'coding',
  'research',
  'writing',
  'work',
  'entertainment',
  'other',
  'unknown',
]);
export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

export const ActivityTagSchema = z.object({
  category: ActivityCategorySchema,
  source: z.enum(['manual', 'heuristic', 'unknown']),
  label: z.string().optional(),
});
export type ActivityTag = z.infer<typeof ActivityTagSchema>;

/**
 * TextMetadata is strictly privacy-preserving.
 * Contains only statistical counters, never raw string contents.
 */
export const TextMetadataSchema = z.object({
  charCount: z.number().min(0),
  wordCount: z.number().min(0),
  estimatedTokens: z.number().min(0),
  modality: z.enum(['text', 'multimodal_image', 'multimodal_doc', 'audio']).default('text'),
  provenance: DataProvenanceSchema,
});
export type TextMetadata = z.infer<typeof TextMetadataSchema>;

export const LedgerEventSchema = z.object({
  id: z.string(),                                // UUID or monotonic id
  timestamp: z.number(),                         // Unix epoch timestamp (ms)
  provider: ProviderIdSchema,
  modelRaw: z.string().nullable().optional(),     // e.g. "gpt-4o", "Claude 3.7 Sonnet" as observed in DOM
  modelFamily: z.string().nullable().optional(),  // e.g. "gpt-4", "claude-3-7", "gemini-2"
  sessionId: z.string(),
  interactionIndex: z.number().min(1),
  durationMs: z.number().min(0).optional(),
  
  // Privacy safe token & character counters (NO PROMPT TEXT)
  input: TextMetadataSchema,
  output: TextMetadataSchema.extend({
    reasoningTokens: z.number().min(0).optional(),
  }),

  activity: ActivityTagSchema,
  impact: ImpactResultSchema,
  confidence: ConfidenceAssessmentSchema,
});

export type LedgerEvent = z.infer<typeof LedgerEventSchema>;

export const LedgerSessionSummarySchema = z.object({
  sessionId: z.string(),
  provider: ProviderIdSchema,
  startTime: z.number(),
  endTime: z.number(),
  interactionCount: z.number().min(1),
  totalInputTokens: z.number().min(0),
  totalOutputTokens: z.number().min(0),
  totalReasoningTokens: z.number().min(0).optional(),
  
  // Aggregated impacts
  totalEnergyWh: MetricValueSchema,
  totalWaterConsumptionMl: MetricValueSchema,
  totalWaterWithdrawalMl: MetricValueSchema.optional(),
  totalCarbonG: MetricValueSchema,
  
  confidence: ConfidenceLevelSchema,
  primaryActivity: ActivityCategorySchema,
});

export type LedgerSessionSummary = z.infer<typeof LedgerSessionSummarySchema>;
