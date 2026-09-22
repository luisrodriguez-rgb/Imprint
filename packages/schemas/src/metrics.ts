import { z } from 'zod';
import { DataProvenanceSchema, ImpactScopeSchema, EpistemicStatusSchema } from './provenance';
import { BoundTypeSchema } from './trace';

export const MetricValueSchema = z.object({
  min: z.number().min(0),
  expected: z.number().min(0),
  max: z.number().min(0),
  unit: z.string(),
  provenance: DataProvenanceSchema,
  scope: ImpactScopeSchema,
  epistemicStatus: EpistemicStatusSchema.optional(),
  boundType: BoundTypeSchema.optional(),
  boundSource: z.string().optional(),
});

export type MetricValue = z.infer<typeof MetricValueSchema>;

export const WaterSubMetricsSchema = z.object({
  onsite: MetricValueSchema,    // Directly evaporated at the data center (cooling towers/adiabatic)
  upstream: MetricValueSchema,  // Evaporated/used offsite during electricity generation (power plants)
  total: MetricValueSchema,     // Sum of onsite + upstream
});

export type WaterSubMetrics = z.infer<typeof WaterSubMetricsSchema>;

export const WaterMetricsSchema = z.object({
  consumption: WaterSubMetricsSchema, // Water lost to evaporation / not returned to immediate local watershed
  withdrawal: WaterSubMetricsSchema,  // Total gross water extracted, including returned cooling water
});

export type WaterMetrics = z.infer<typeof WaterMetricsSchema>;

export const EnergyMetricsSchema = z.object({
  operational: MetricValueSchema,          // GPU / CPU / RAM consumed directly by model execution
  datacenterPueOverhead: MetricValueSchema,// Overhead from facility (PUE multiplier - 1.0)
  total: MetricValueSchema,                // operational * PUE
});

export type EnergyMetrics = z.infer<typeof EnergyMetricsSchema>;

export const CarbonMetricsSchema = z.object({
  operational: MetricValueSchema,          // From operational energy * grid carbon intensity
  lifecycleEmbodied: MetricValueSchema.optional(), // Scope 3 embodied server manufacturing (if methodology supports)
  total: MetricValueSchema,
});

export type CarbonMetrics = z.infer<typeof CarbonMetricsSchema>;

export const MineralMetricsSchema = z.object({
  depletion: MetricValueSchema,            // mg Sb-eq (antimony equivalent) per interaction
});

export type MineralMetrics = z.infer<typeof MineralMetricsSchema>;

export const ImpactResultSchema = z.object({
  methodologyId: z.string(),
  methodologyVersion: z.string(),
  energy: EnergyMetricsSchema,
  water: WaterMetricsSchema,
  carbon: CarbonMetricsSchema,
  minerals: MineralMetricsSchema.optional(),
});

export type ImpactResult = z.infer<typeof ImpactResultSchema>;
