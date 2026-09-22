import { z } from 'zod';

export const DataProvenanceSchema = z.enum([
  'provider_api',          // Exact numbers reported directly by official provider API
  'provider_export',       // Data extracted from official user data exports (e.g. Google Takeout, Claude export)
  'browser_observation',   // Observed directly in DOM (e.g. response character count, turn completion)
  'local_estimation',      // Heuristically computed client-side (e.g. token estimate from text length)
  'methodology_model',     // Environmental calculation output derived from a scientific methodology
]);

export type DataProvenance = z.infer<typeof DataProvenanceSchema>;

export const ImpactScopeSchema = z.enum([
  'operational', // Direct compute hardware activity (GPU, CPU, RAM during inference)
  'datacenter',  // Physical facility overhead (cooling towers, HVAC, power conditioning, PUE)
  'grid',        // Upstream electricity generation (power plant water withdrawal & evaporation, grid transmission)
  'lifecycle',   // Full cradle-to-grave / cradle-to-gate hardware manufacturing & transport (Scope 3 embodiment)
]);

export type ImpactScope = z.infer<typeof ImpactScopeSchema>;
