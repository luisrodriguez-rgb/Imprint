import { z } from 'zod';

export const CoolingTechnologySchema = z.enum([
  'evaporative_cooling_tower',
  'adiabatic_dry_cooler',
  'chilled_water_system',
  'direct_to_chip_liquid',
  'immersion_liquid',
  'unspecified_hyperscale_average',
]);

export type CoolingTechnology = z.infer<typeof CoolingTechnologySchema>;

/**
 * SystemParameters defines infrastructure and environmental parameters
 * cleanly separated from the structural scientific methodology.
 */
export const SystemParametersSchema = z.object({
  pue: z.number().min(1.0).max(3.0).default(1.12),
  gridCarbonIntensityGPerKwh: z.number().min(0).max(1200).default(380),
  wueLPerKwh: z.number().min(0).max(10.0).default(0.30),
  ewifLPerKwh: z.number().min(0).max(30.0).default(1.80),
  coolingTechnology: CoolingTechnologySchema.default('unspecified_hyperscale_average'),
  scenarioName: z.string().optional().default('baseline_hyperscale'),
});

export type SystemParameters = z.infer<typeof SystemParametersSchema>;

export const PartialSystemParametersSchema = SystemParametersSchema.partial();
export type PartialSystemParameters = z.infer<typeof PartialSystemParametersSchema>;
