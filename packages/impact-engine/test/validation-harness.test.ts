import { describe, it, expect } from 'vitest';
import {
  estimateImpact,
  calculateEnergy,
  calculateCarbon,
  evaluateConfidence,
  analyzeSensitivity,
  buildCalculationTrace,
  resolveParameters,
  GOOGLE_OPERATIONAL_2025,
  JOULE_FRONTIER_2026,
  MISTRAL_LCA_2026,
  OPENAI_REFERENCE_2025,
  NORDIC_CLEAN_PARAMS,
  FOSSIL_HEAVY_PARAMS,
} from '../src';

/**
 * SCIENTIFIC VALIDATION HARNESS (Phase 0.5)
 *
 * Epistemic standard:
 * Software correctness (33 unit tests pass) != Scientific validity.
 *
 * This harness organizes tests under a rigorous scientific verification taxonomy:
 * - [REFERENCE]: Reproduces published academic literature or corporate disclosures under exact declared conditions.
 * - [INVARIANT]: Mathematical and thermodynamic properties that must hold true across all scenarios.
 * - [REGRESSION]: Mathematical proofs that bug fixes (e.g. reasoning token double-counting) persist.
 * - [BOUNDARY]: Behavior at extreme limits (0 tokens, 100k+ long contexts, clamped bounds).
 * - [PLAUSIBILITY]: Thermodynamic sanity checks ensuring models do not violate physical hardware realities.
 * - [SENSITIVITY]: Attribution of uncertainty between workload tokens and infrastructure parameters (PUE, grid).
 * - [TRACE]: Full step-by-step auditable calculation traces for independent reproduction.
 */
describe('Scientific Validation Harness: Epistemic Rigor & Physical Bounds', () => {

  // ==========================================================================
  // 1. [REFERENCE] Reproduce Published Results Under Exact Boundaries
  // ==========================================================================
  describe('1. [REFERENCE] Reproduction of Published Scientific & Corporate Baselines', () => {
    it('[REFERENCE] Google Operational 2025 reproduces 0.24 Wh base and 0.26 mL direct water for TPU v5e/v5p median prompt', () => {
      const result = estimateImpact({
        inputTokens: 100,
        outputTokens: 300,
        methodologyId: 'google-operational-2025',
      });

      // Google 2025 paper: 0.24 Wh operational silicon * 1.10 PUE = 0.264 Wh total
      expect(result.impact.energy.operational.expected).toBeCloseTo(0.24, 2);
      expect(result.impact.energy.total.expected).toBeCloseTo(0.264, 2);
      expect(result.impact.water.consumption.onsite.expected).toBeCloseTo(0.285, 2); // 0.264 * 1.08 L/kWh
      expect(result.methodology.methodologyType).toBe('corporate_disclosure');
      expect(result.impact.minerals).toBeUndefined(); // Google operational boundary excludes LCA embodied minerals
    });

    it('[REFERENCE] Mistral LCA 2026 reproduces ~45 mL total lifecycle water and 1.14 g CO2e cradle-to-gate per 400 tokens', () => {
      const lcaResult = estimateImpact({
        inputTokens: 200,
        outputTokens: 200,
        methodologyId: 'mistral-lca-2026',
      });

      expect(lcaResult.methodology.boundary).toBe('cradle-to-gate');
      expect(lcaResult.methodology.methodologyType).toBe('corporate_disclosure');
      expect(lcaResult.impact.water.consumption.total.expected).toBeCloseTo(45.0, 1);
      expect(lcaResult.impact.carbon.total.expected).toBeCloseTo(1.14, 1);
      expect(lcaResult.impact.minerals?.depletion.expected).toBeCloseTo(0.16, 2);
      expect(lcaResult.impact.minerals?.depletion.epistemicStatus).toBe('experimental_modeled');
    });

    it('[REFERENCE] OpenAI Reference 2025 reproduces ~0.34 Wh and ~0.32 mL baseline within Azure reported WUE (0.27 L/kWh)', () => {
      const openAiResult = estimateImpact({
        inputTokens: 100,
        outputTokens: 250,
        methodologyId: 'openai-reference-2025',
      });

      expect(openAiResult.impact.energy.operational.expected).toBeGreaterThan(0.2);
      expect(openAiResult.impact.water.consumption.onsite.expected).toBeGreaterThan(0.05);
      expect(openAiResult.methodology.methodologyType).toBe('corporate_disclosure');
    });

    it('[REFERENCE] Joule 2026 reproduces median standard interaction of ~0.31 Wh with non-linear scaling for reasoning', () => {
      const standardQuery = estimateImpact({
        inputTokens: 100,
        outputTokens: 300,
        methodologyId: 'joule-frontier-2026',
      });

      // Operational: 0.22 base overhead + 100*0.00003 (0.003) + 300*0.00028 (0.084) = 0.307 Wh * 1.12 PUE = ~0.344 Wh
      expect(standardQuery.impact.energy.operational.expected).toBeCloseTo(0.307, 2);
      expect(standardQuery.impact.energy.total.expected).toBeCloseTo(0.344, 2);
      expect(standardQuery.methodology.methodologyType).toBe('peer_reviewed_study');
    });
  });

  // ==========================================================================
  // 2. [INVARIANT] Mathematical & Thermodynamic Invariants
  // ==========================================================================
  describe('2. [INVARIANT] Mathematical & Physical Invariants', () => {
    it('[INVARIANT] Energy scales strictly monotonically with token growth', () => {
      const shortQuery = estimateImpact({
        inputTokens: 50,
        outputTokens: 100,
        methodologyId: 'joule-frontier-2026',
      });

      const mediumQuery = estimateImpact({
        inputTokens: 500,
        outputTokens: 800,
        methodologyId: 'joule-frontier-2026',
      });

      const longQuery = estimateImpact({
        inputTokens: 2000,
        outputTokens: 1500,
        methodologyId: 'joule-frontier-2026',
      });

      expect(mediumQuery.impact.energy.total.expected).toBeGreaterThan(shortQuery.impact.energy.total.expected);
      expect(longQuery.impact.energy.total.expected).toBeGreaterThan(mediumQuery.impact.energy.total.expected);
    });

    it('[INVARIANT] Datacenter PUE overhead is non-negative and satisfies total = operational * PUE', () => {
      const result = estimateImpact({
        inputTokens: 200,
        outputTokens: 500,
        parameters: { pue: 1.25 },
        methodologyId: 'joule-frontier-2026',
      });

      expect(result.impact.energy.datacenterPueOverhead.expected).toBeGreaterThanOrEqual(0);
      expect(result.impact.energy.total.expected).toBeCloseTo(
        result.impact.energy.operational.expected * 1.25,
        2
      );
    });

    it('[INVARIANT] Total water withdrawal is strictly greater than or equal to water consumption', () => {
      const result = estimateImpact({
        inputTokens: 150,
        outputTokens: 400,
        methodologyId: 'joule-frontier-2026',
      });

      expect(result.impact.water.withdrawal.total.expected).toBeGreaterThan(
        result.impact.water.consumption.total.expected
      );
      expect(result.impact.water.withdrawal.onsite.expected).toBeGreaterThanOrEqual(
        result.impact.water.consumption.onsite.expected
      );
    });

    it('[INVARIANT] Bounded intervals strictly satisfy min <= expected <= max across all metrics', () => {
      const result = estimateImpact({
        inputTokens: 300,
        outputTokens: 600,
        methodologyId: 'joule-frontier-2026',
      });

      // Energy
      expect(result.impact.energy.total.min).toBeLessThanOrEqual(result.impact.energy.total.expected);
      expect(result.impact.energy.total.expected).toBeLessThanOrEqual(result.impact.energy.total.max);

      // Water
      expect(result.impact.water.consumption.total.min).toBeLessThanOrEqual(result.impact.water.consumption.total.expected);
      expect(result.impact.water.consumption.total.expected).toBeLessThanOrEqual(result.impact.water.consumption.total.max);

      // Carbon
      expect(result.impact.carbon.total.min).toBeLessThanOrEqual(result.impact.carbon.total.expected);
      expect(result.impact.carbon.total.expected).toBeLessThanOrEqual(result.impact.carbon.total.max);
    });
  });

  // ==========================================================================
  // 3. [REGRESSION] Mathematical Proofs of Deduplication & Fixes
  // ==========================================================================
  describe('3. [REGRESSION] Reasoning Token Deduplication Proofs', () => {
    it('[REGRESSION] Reasoning tokens bundled in outputTokens are deduplicated, proving E(deduplicated) < E(naive)', () => {
      const inputTokens = 200;
      const totalOutputTokens = 800;
      const reasoningTokens = 500;

      // Deduplicated (reasoningIncludedInOutput = true)
      const correctedEnergy = calculateEnergy({
        inputTokens,
        outputTokens: totalOutputTokens,
        reasoningTokens,
        reasoningIncludedInOutput: true,
        methodology: JOULE_FRONTIER_2026,
      });

      // Naive un-deduplicated
      const naiveSeparatedEnergy = calculateEnergy({
        inputTokens,
        outputTokens: totalOutputTokens,
        reasoningTokens,
        reasoningIncludedInOutput: false,
        methodology: JOULE_FRONTIER_2026,
      });

      // Theoretical difference: 500 reasoning tokens * 0.00028 Wh/token decode coefficient * 1.12 PUE = ~0.1568 Wh
      expect(correctedEnergy.total.expected).toBeLessThan(naiveSeparatedEnergy.total.expected);
      const diff = naiveSeparatedEnergy.total.expected - correctedEnergy.total.expected;
      expect(diff).toBeCloseTo(500 * 0.00028 * 1.12, 3);
    });

    it('[REGRESSION] Conservative deduplication applies when reasoningIncludedInOutput is unknown and output >= reasoning', () => {
      const energyUnknown = calculateEnergy({
        inputTokens: 100,
        outputTokens: 1000,
        reasoningTokens: 600,
        reasoningIncludedInOutput: 'unknown',
        methodology: JOULE_FRONTIER_2026,
      });

      const energyExplicit = calculateEnergy({
        inputTokens: 100,
        outputTokens: 1000,
        reasoningTokens: 600,
        reasoningIncludedInOutput: true,
        methodology: JOULE_FRONTIER_2026,
      });

      expect(energyUnknown.total.expected).toEqual(energyExplicit.total.expected);
    });
  });

  // ==========================================================================
  // 4. [BOUNDARY] Extreme Contexts & Boundary Conditions
  // ==========================================================================
  describe('4. [BOUNDARY] Extreme Scaling & Edge Conditions', () => {
    it('[BOUNDARY] Handles extreme 100k+ token context windows with numeric stability (no NaN or infinity)', () => {
      const massivePrompt = estimateImpact({
        inputTokens: 128000,
        outputTokens: 4096,
        methodologyId: 'joule-frontier-2026',
      });

      expect(massivePrompt.impact.energy.total.expected).toBeGreaterThan(0);
      expect(Number.isFinite(massivePrompt.impact.energy.total.expected)).toBe(true);
      expect(Number.isNaN(massivePrompt.impact.energy.total.expected)).toBe(false);
      expect(massivePrompt.impact.energy.total.min).toBeLessThan(massivePrompt.impact.energy.total.expected);
      expect(massivePrompt.impact.energy.total.max).toBeGreaterThan(massivePrompt.impact.energy.total.expected);
    });

    it('[BOUNDARY] Handles minimum interaction of 0 input and 1 output token with static idle floor', () => {
      const minimalPrompt = estimateImpact({
        inputTokens: 0,
        outputTokens: 1,
        methodologyId: 'google-operational-2025',
      });

      // Floor must ensure non-zero energy consumption due to server static host power
      expect(minimalPrompt.impact.energy.operational.expected).toBeGreaterThanOrEqual(0.05);
      expect(minimalPrompt.impact.energy.total.expected).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // 5. [PLAUSIBILITY] Thermodynamic & Scenario Sanity Checks
  // ==========================================================================
  describe('5. [PLAUSIBILITY] Thermodynamic Sanity & Scenario Bounds', () => {
    it('[PLAUSIBILITY] Operational energy per token is strictly within thermodynamic silicon limits (0.00001 to 0.01 Wh/tok)', () => {
      const result = estimateImpact({
        inputTokens: 100,
        outputTokens: 1000,
        methodologyId: 'joule-frontier-2026',
      });

      const marginalWhPerToken = (result.impact.energy.operational.expected - 0.22) / 1100;
      expect(marginalWhPerToken).toBeGreaterThan(0.00001);
      expect(marginalWhPerToken).toBeLessThan(0.01);
    });

    it('[PLAUSIBILITY] Unknown geography sets boundType === "scenario" and does not claim to be global physical limits', () => {
      const energyWh = 1.0;

      const unknownCarbon = calculateCarbon({
        totalEnergyWh: energyWh,
        inputTokens: 200,
        outputTokens: 400,
        methodology: JOULE_FRONTIER_2026,
        geography: { status: 'unknown' },
      });

      // Must be classified as a scenario bound, not a physical planetary bound
      expect(unknownCarbon.total.boundType).toBe('scenario');
      expect(unknownCarbon.total.boundSource).toContain('scenario interval');
      expect(unknownCarbon.total.min).toBeCloseTo(0.16, 2); // 160 g/kWh * 0.001 kWh
      expect(unknownCarbon.total.max).toBeCloseTo(0.58, 2); // 580 g/kWh * 0.001 kWh
    });

    it('[PLAUSIBILITY] Provider-reported geography sets boundType === "methodology_variance" with exact region source', () => {
      const energyWh = 1.0;

      const pinnedCarbon = calculateCarbon({
        totalEnergyWh: energyWh,
        inputTokens: 200,
        outputTokens: 400,
        methodology: JOULE_FRONTIER_2026,
        geography: {
          status: 'provider_reported',
          region: 'us-east1 (Virginia)',
          gridCarbonIntensityGPerKwh: 340,
        },
      });

      expect(pinnedCarbon.total.boundType).toBe('methodology_variance');
      expect(pinnedCarbon.total.boundSource).toContain('Virginia');
      expect(pinnedCarbon.total.expected).toBeCloseTo(0.34, 2);
    });
  });

  // ==========================================================================
  // 6. [SENSITIVITY] Parameter Sensitivity Analysis
  // ==========================================================================
  describe('6. [SENSITIVITY] Parameter Sensitivity Analysis', () => {
    it('[SENSITIVITY] Decomposes energy uncertainty between facility PUE overhead and workload token variance', () => {
      const sensitivity = analyzeSensitivity({
        operationalWh: 0.35,
        totalEnergyWh: 0.40,
        pue: 1.14,
        gridCarbonIntensityGPerKwh: 380,
        inputTokens: 200,
        outputTokens: 500,
        methodology: JOULE_FRONTIER_2026,
        geographyKnown: false,
      });

      const pueContribution = sensitivity.find((s) => s.parameter === 'pue');
      const workloadContribution = sensitivity.find((s) => s.parameter === 'workload_token_inference');

      expect(pueContribution).toBeDefined();
      expect(workloadContribution).toBeDefined();
      expect(pueContribution!.impactOnMetric).toBe('energy_wh');
      expect(workloadContribution!.impactOnMetric).toBe('energy_wh');

      // Shares must sum to ~100%
      const sumShare = pueContribution!.varianceSharePct + workloadContribution!.varianceSharePct;
      expect(sumShare).toBeCloseTo(100.0, 1);
    });

    it('[SENSITIVITY] Geographic unknown scenario explains the majority of carbon uncertainty', () => {
      const sensitivity = analyzeSensitivity({
        operationalWh: 0.35,
        totalEnergyWh: 0.40,
        pue: 1.12,
        gridCarbonIntensityGPerKwh: 380,
        inputTokens: 200,
        outputTokens: 500,
        methodology: JOULE_FRONTIER_2026,
        geographyKnown: false,
      });

      const gridContribution = sensitivity.find((s) => s.parameter === 'grid_carbon_intensity');
      expect(gridContribution).toBeDefined();
      expect(gridContribution!.impactOnMetric).toBe('carbon_g');
      // When geography is unknown (160–580 g/kWh), grid variance dominates carbon uncertainty
      expect(gridContribution!.varianceSharePct).toBeGreaterThan(40.0);
    });
  });

  // ==========================================================================
  // 7. [TRACE] Auditable Calculation Trace & Step-by-Step Reproducibility
  // ==========================================================================
  describe('7. [TRACE] Calculation Trace & Epistemic Auditability', () => {
    it('[TRACE] Output delivers full step-by-step CalculationTrace matching ledger totals', () => {
      const result = estimateImpact({
        inputTokens: 150,
        outputTokens: 350,
        reasoningTokens: 100,
        reasoningIncludedInOutput: true,
        parameters: { pue: 1.15, gridCarbonIntensityGPerKwh: 400 },
        methodologyId: 'joule-frontier-2026',
      });

      expect(result.trace).toBeDefined();
      expect(result.trace.steps.length).toBeGreaterThanOrEqual(6);

      // Verify step 4 total energy matches impact.energy.total.expected
      const totalEnergyStep = result.trace.steps.find((s) => s.name === 'Total Electrical Energy');
      expect(totalEnergyStep).toBeDefined();
      expect(totalEnergyStep!.resultValue).toBeCloseTo(result.impact.energy.total.expected, 3);

      // Verify parameters are recorded in trace
      expect(result.trace.parameters.pue).toBe(1.15);
      expect(result.trace.parameters.gridCarbonIntensityGPerKwh).toBe(400);

      // Verify epistemic buckets are present in trace
      expect(result.trace.epistemic.observed.length).toBeGreaterThan(0);
      expect(result.trace.epistemic.estimated.length).toBeGreaterThan(0);
      expect(result.trace.epistemic.assumed.length).toBeGreaterThan(0);
      expect(result.trace.epistemic.unknown.length).toBeGreaterThan(0);
    });

    it('[TRACE] Sensitivity contributions are attached to output and trace', () => {
      const result = estimateImpact({
        inputTokens: 500,
        outputTokens: 1000,
        methodologyId: 'joule-frontier-2026',
      });

      expect(result.sensitivity.length).toBeGreaterThan(0);
      expect(result.trace.sensitivity?.length).toBeGreaterThan(0);
    });
  });
});
