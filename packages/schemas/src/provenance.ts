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

/**
 * EpistemicStatus is the third orthogonal dimension:
 * Clarifies what Imprint knows vs. what Imprint models vs. what is completely unknown.
 */
export const EpistemicStatusSchema = z.enum([
  'observed',              // Directly observable in browser DOM or protocol (chars, response completion, timestamp)
  'estimated',             // Statistically inferred via client algorithms (e.g. token counts)
  'modeled',               // Derived through scientific formulas from literature (e.g. energy Wh)
  'assumed',               // Standardized baseline parameter (e.g. hyperscale facility PUE = 1.15)
  'unknown',               // Completely unknown physical reality (e.g. server location, rack concurrency)
  'experimental_modeled',  // High-uncertainty LCA extrapolation (e.g. mineral depletion mg Sb-eq)
]);

export type EpistemicStatus = z.infer<typeof EpistemicStatusSchema>;

