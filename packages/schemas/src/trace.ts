import { z } from 'zod';
import { EpistemicBucketSchema } from './confidence';
import { MethodologySchema } from './methodology';
import { SystemParametersSchema } from './parameters';

export const BoundTypeSchema = z.enum([
  'scenario',               // Explores discrete plausible infrastructure/grid scenarios (e.g. 160 vs 580 g/kWh)
  'methodology_variance',   // Statistical variance reported in original academic publication (e.g. ±25%)
  'empirical_range',        // Direct instrumented measurement range
  'confidence_interval',    // Formal statistical CI (e.g. 95% CI)
]);

export type BoundType = z.infer<typeof BoundTypeSchema>;

export const CalculationStepSchema = z.object({
  stepNumber: z.number(),
  name: z.string(),
  formula: z.string(),
  inputValues: z.record(z.string(), z.union([z.number(), z.string(), z.boolean()])),
  resultValue: z.number(),
  resultUnit: z.string(),
  epistemicType: z.enum(['observed', 'estimated', 'assumed', 'modeled']),
  notes: z.string().optional(),
});

export type CalculationStep = z.infer<typeof CalculationStepSchema>;

export const SensitivityContributionSchema = z.object({
  parameter: z.string(),
  baselineValue: z.number(),
  perturbedMin: z.number(),
  perturbedMax: z.number(),
  impactOnMetric: z.enum(['energy_wh', 'water_ml', 'carbon_g']),
  varianceSharePct: z.number().min(0).max(100), // e.g. 12% of total uncertainty
  description: z.string(),
});

export type SensitivityContribution = z.infer<typeof SensitivityContributionSchema>;

export const CalculationTraceSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  methodology: MethodologySchema,
  parameters: SystemParametersSchema,
  steps: z.array(CalculationStepSchema),
  epistemic: EpistemicBucketSchema,
  sensitivity: z.array(SensitivityContributionSchema).optional(),
});

export type CalculationTrace = z.infer<typeof CalculationTraceSchema>;
