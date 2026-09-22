import { z } from 'zod';

export const ConfidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const ChecklistItemStatusSchema = z.enum(['verified', 'inferred', 'assumed']);
export type ChecklistItemStatus = z.infer<typeof ChecklistItemStatusSchema>;

export const ConfidenceChecklistItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: ChecklistItemStatusSchema,
  passed: z.boolean(),
  description: z.string(),
});

export type ConfidenceChecklistItem = z.infer<typeof ConfidenceChecklistItemSchema>;

export const ConfidenceAssessmentSchema = z.object({
  level: ConfidenceLevelSchema,
  score: z.number().min(0).max(100),
  summary: z.string(),
  checklist: z.array(ConfidenceChecklistItemSchema),
});

export type ConfidenceAssessment = z.infer<typeof ConfidenceAssessmentSchema>;
