import { z } from 'zod';

export const ConfidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const ChecklistItemStatusSchema = z.enum(['verified', 'inferred', 'assumed', 'unknown']);
export type ChecklistItemStatus = z.infer<typeof ChecklistItemStatusSchema>;

export const ConfidenceChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: ChecklistItemStatusSchema,
  passed: z.boolean(),
  description: z.string(),
});

export type ConfidenceChecklistItem = z.infer<typeof ConfidenceChecklistItemSchema>;

/**
 * EpistemicBucket structures epistemic transparency:
 * What is directly observed, what is estimated, what is assumed, and what is unknown.
 */
export const EpistemicBucketSchema = z.object({
  observed: z.array(z.string()).default([]),
  estimated: z.array(z.string()).default([]),
  assumed: z.array(z.string()).default([]),
  unknown: z.array(z.string()).default([]),
});

export type EpistemicBucket = z.infer<typeof EpistemicBucketSchema>;

export const ConfidenceAssessmentSchema = z.object({
  level: ConfidenceLevelSchema,
  score: z.number().min(0).max(100),
  summary: z.string(),
  checklist: z.array(ConfidenceChecklistItemSchema),
  epistemic: EpistemicBucketSchema.optional(),
});

export type ConfidenceAssessment = z.infer<typeof ConfidenceAssessmentSchema>;
