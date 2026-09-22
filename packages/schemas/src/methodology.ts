import { z } from 'zod';
import { ImpactScopeSchema } from './provenance';

export const MethodologyBoundarySchema = z.enum([
  'operational',     // Compute hardware only during inference
  'datacenter',      // Compute hardware + onsite cooling/facility overhead
  'cradle-to-gate',  // Datacenter operational + upstream electricity generation & manufacturing
  'lifecycle',       // Full life cycle assessment including end-of-life recycling & disposal
]);

export type MethodologyBoundary = z.infer<typeof MethodologyBoundarySchema>;

export const MetricTypeSchema = z.enum([
  'energy_wh',
  'water_consumption_ml',
  'water_withdrawal_ml',
  'carbon_g_co2e',
  'mineral_depletion_mg_sbeq',
]);

export type MetricType = z.infer<typeof MetricTypeSchema>;

export const MethodologySourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  authors: z.string().optional(),
  year: z.number(),
  publisher: z.string().optional(),
  url: z.string().url().optional(),
  doi: z.string().optional(),
  notes: z.string().optional(),
});

export type MethodologySource = z.infer<typeof MethodologySourceSchema>;

export const MethodologyUncertaintyModelSchema = z.object({
  energyVariancePct: z.number().min(0).max(500),    // e.g. 25 means ±25%
  waterVariancePct: z.number().min(0).max(500),
  carbonVariancePct: z.number().min(0).max(500),
  notes: z.string().optional(),
});

export type MethodologyUncertaintyModel = z.infer<typeof MethodologyUncertaintyModelSchema>;

export const MethodologySchema = z.object({
  id: z.string(),                                  // e.g. "google-operational-2025"
  name: z.string(),
  version: z.string(),                             // e.g. "1.0.0"
  description: z.string(),
  boundary: MethodologyBoundarySchema,
  primaryScope: ImpactScopeSchema,
  metricsSupported: z.array(MetricTypeSchema),
  assumptions: z.array(z.string()),
  sources: z.array(MethodologySourceSchema),
  uncertaintyModel: MethodologyUncertaintyModelSchema,
});

export type Methodology = z.infer<typeof MethodologySchema>;
