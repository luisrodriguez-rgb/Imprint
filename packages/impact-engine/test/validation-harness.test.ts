import { describe, it, expect } from 'vitest';
import {
  estimateImpact,
  calculateEnergy,
  calculateCarbon,
  evaluateConfidence,
  getMethodology,
  GOOGLE_OPERATIONAL_2025,
  JOULE_FRONTIER_2026,
  MISTRAL_LCA_2026,
  OPENAI_REFERENCE_2025,
} from '../src';

describe('Scientific Validation Harness: Epistemic Rigor & Regression Suite', () => {
  // --------------------------------------------------------------------------
  // SUITE 1: Synthetic Baselines & Methodology Invariants
  // --------------------------------------------------------------------------
  describe('Suite 1: Synthetic Baselines & Mathematical Invariants', () => {
    it('Google Operational 2025 produces ~0.24 Wh and ~0.26 mL for median 400-token prompt', () => {
      const result = estimateImpact({
        inputTokens: 100,
        outputTokens: 300,
        methodologyId: 'google-operational-2025',
      });

      // Verification against Google reported fleet figures (TPU v5e/v5p)
      expect(result.impact.energy.total.expected).toBeCloseTo(0.264, 2); // 0.24 * 1.10 PUE = 0.264 Wh
      expect(result.impact.water.consumption.onsite.expected).toBeCloseTo(0.285, 2); // 0.264 * 1.08 = ~0.285 mL
      expect(result.methodology.methodologyType).toBe('corporate_disclosure');
      expect(result.impact.minerals).toBeUndefined(); // Google operational boundary does not support LCA minerals
    });

    it('Joule Frontier 2026 scales monotonically with token counts', () => {
      const shortQuery = estimateImpact({
        inputTokens: 50,
        outputTokens: 100,
        methodologyId: 'joule-frontier-2026',
      });

      const longQuery = estimateImpact({
        inputTokens: 2000,
        outputTokens: 1500,
        methodologyId: 'joule-frontier-2026',
      });

      expect(longQuery.impact.energy.total.expected).toBeGreaterThan(shortQuery.impact.energy.total.expected);
      expect(longQuery.impact.water.consumption.total.expected).toBeGreaterThan(shortQuery.impact.water.consumption.total.expected);
      expect(longQuery.impact.carbon.total.expected).toBeGreaterThan(shortQuery.impact.carbon.total.expected);
      expect(shortQuery.methodology.methodologyType).toBe('peer_reviewed_study');
    });

    it('handles extreme 100k token context windows without numeric overflow or instability', () => {
      const massivePrompt = estimateImpact({
        inputTokens: 100000,
        outputTokens: 4000,
        methodologyId: 'joule-frontier-2026',
      });

      expect(massivePrompt.impact.energy.total.expected).toBeGreaterThan(0);
      expect(Number.isFinite(massivePrompt.impact.energy.total.expected)).toBe(true);
      expect(massivePrompt.impact.energy.total.min).toBeLessThan(massivePrompt.impact.energy.total.expected);
      expect(massivePrompt.impact.energy.total.max).toBeGreaterThan(massivePrompt.impact.energy.total.expected);
    });

    it('Mistral Cradle-to-Gate LCA 2026 models embodied manufacturing and water withdrawal', () => {
      const lcaResult = estimateImpact({
        inputTokens: 200,
        outputTokens: 200,
        methodologyId: 'mistral-lca-2026',
      });

      expect(lcaResult.methodology.boundary).toBe('cradle-to-gate');
      expect(lcaResult.methodology.methodologyType).toBe('corporate_disclosure');
      expect(lcaResult.impact.water.withdrawal.total.expected).toBeGreaterThan(0);
      expect(lcaResult.impact.carbon.lifecycleEmbodied?.expected).toBeGreaterThan(0);
      expect(lcaResult.impact.minerals?.depletion.expected).toBeGreaterThan(0);
      expect(lcaResult.impact.minerals?.depletion.epistemicStatus).toBe('experimental_modeled');
    });

    it('OpenAI Reference 2025 adheres to published baseline and Azure WUE', () => {
      const openAiResult = estimateImpact({
        inputTokens: 100,
        outputTokens: 250,
        methodologyId: 'openai-reference-2025',
      });

      expect(openAiResult.impact.energy.total.expected).toBeGreaterThan(0.2);
      expect(openAiResult.impact.water.consumption.onsite.expected).toBeGreaterThan(0.05);
      expect(openAiResult.methodology.methodologyType).toBe('corporate_disclosure');
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 2: Reasoning Token Double-Counting Regression Fix
  // --------------------------------------------------------------------------
  describe('Suite 2: Reasoning Token Double-Counting Mathematical Proof', () => {
    it('prevents double counting when reasoning tokens are bundled inside outputTokens', () => {
      const inputTokens = 200;
      const totalOutputTokens = 800; // Bundled output (e.g. OpenAI o-series completion_tokens = 800)
      const reasoningTokens = 500;   // 500 reasoning + 300 visible completion

      // 1. With double-counting fix (reasoningIncludedInOutput: true)
      const correctedEnergy = calculateEnergy({
        inputTokens,
        outputTokens: totalOutputTokens,
        reasoningTokens,
        reasoningIncludedInOutput: true,
        methodology: JOULE_FRONTIER_2026,
      });

      // 2. Naive un-deduplicated calculation (treating outputTokens as separate from reasoning)
      const naiveSeparatedEnergy = calculateEnergy({
        inputTokens,
        outputTokens: totalOutputTokens,
        reasoningTokens,
        reasoningIncludedInOutput: false,
        methodology: JOULE_FRONTIER_2026,
      });

      // Theoretical difference: 500 reasoning tokens * 0.00028 Wh/token decode coefficient
      // * 1.12 PUE = ~0.1568 Wh saved from false inflation
      expect(correctedEnergy.total.expected).toBeLessThan(naiveSeparatedEnergy.total.expected);
      const differenceWh = naiveSeparatedEnergy.total.expected - correctedEnergy.total.expected;
      expect(differenceWh).toBeCloseTo(500 * 0.00028 * 1.12, 3);
    });

    it('conservatively deduplicates when reasoningIncludedInOutput is unknown but outputTokens >= reasoningTokens', () => {
      const energyUnknown = calculateEnergy({
        inputTokens: 100,
        outputTokens: 1000,
        reasoningTokens: 600,
        reasoningIncludedInOutput: 'unknown',
        methodology: JOULE_FRONTIER_2026,
      });

      const energyExplicitlyIncluded = calculateEnergy({
        inputTokens: 100,
        outputTokens: 1000,
        reasoningTokens: 600,
        reasoningIncludedInOutput: true,
        methodology: JOULE_FRONTIER_2026,
      });

      expect(energyUnknown.total.expected).toEqual(energyExplicitlyIncluded.total.expected);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 3: Geographic Decoupling & Datacenter Uncertainty Bounds
  // --------------------------------------------------------------------------
  describe('Suite 3: Geographic Decoupling & Physical Uncertainty Bounds', () => {
    it('expands carbon bounds to full hyperscale spread (160 to 580 g/kWh) when geography is unknown', () => {
      const energyWh = 1.0; // 0.001 kWh

      const unknownResult = calculateCarbon({
        totalEnergyWh: energyWh,
        inputTokens: 200,
        outputTokens: 400,
        methodology: JOULE_FRONTIER_2026,
        geography: { status: 'unknown' },
      });

      // Min must reflect low-carbon hydro/nuclear grid (~160 g/kWh * 0.001 kWh = 0.16 g)
      // Max must reflect marginal fossil peaker grid (~580 g/kWh * 0.001 kWh = 0.58 g)
      expect(unknownResult.total.min).toBeCloseTo(0.16, 2);
      expect(unknownResult.total.max).toBeCloseTo(0.58, 2);
      expect(unknownResult.operational.provenance).toBe('methodology_model');
    });

    it('pins carbon intensity and marks provenance as provider_api when provider reports exact region', () => {
      const energyWh = 1.0;

      const pinnedResult = calculateCarbon({
        totalEnergyWh: energyWh,
        inputTokens: 200,
        outputTokens: 400,
        methodology: JOULE_FRONTIER_2026,
        geography: {
          status: 'provider_reported',
          region: 'us-central1 (Iowa)',
          gridCarbonIntensityGPerKwh: 240,
        },
      });

      // With ±35% methodology variance on 240 * 0.001 = 0.24 g
      expect(pinnedResult.total.expected).toBeCloseTo(0.24, 2);
      expect(pinnedResult.operational.provenance).toBe('provider_api');
      expect(pinnedResult.total.min).toBeCloseTo(0.24 * (1 - 0.35), 2);
      expect(pinnedResult.total.max).toBeCloseTo(0.24 * (1 + 0.35), 2);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 4: Epistemic Transparency Buckets (Honesty Contract)
  // --------------------------------------------------------------------------
  describe('Suite 4: Epistemic Transparency Buckets', () => {
    it('populates observed, estimated, assumed, and unknown buckets in confidence assessment', () => {
      const assessment = evaluateConfidence({
        modelDetected: true,
        outputObserved: true,
        inputProvenance: 'local_estimation',
        outputProvenance: 'browser_observation',
        datacenterKnown: false,
        reasoningIncludedInOutput: 'unknown',
      });

      expect(assessment.epistemic).toBeDefined();
      const epistemic = assessment.epistemic!;

      // Observed: What can truly be seen from the browser client
      expect(epistemic.observed.length).toBeGreaterThan(0);
      expect(epistemic.observed.some((item) => item.includes('character counts'))).toBe(true);

      // Estimated: Inferred via client algorithms
      expect(epistemic.estimated.length).toBeGreaterThan(0);
      expect(epistemic.estimated.some((item) => item.includes('Input prompt tokens'))).toBe(true);

      // Assumed: Literature and industry baseline constants
      expect(epistemic.assumed.length).toBeGreaterThan(0);
      expect(epistemic.assumed.some((item) => item.includes('PUE'))).toBe(true);

      // Unknown: Decoupled physical reality that cannot be known from client
      expect(epistemic.unknown.length).toBeGreaterThan(0);
      expect(epistemic.unknown.some((item) => item.includes('datacenter facility'))).toBe(true);
      expect(epistemic.unknown.some((item) => item.includes('cooling mode'))).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // SUITE 5: Epistemic Status Tags on Metrics
  // --------------------------------------------------------------------------
  describe('Suite 5: Epistemic Status Tags', () => {
    it('tags operational metrics as modeled and mineral depletion as experimental_modeled', () => {
      const result = estimateImpact({
        inputTokens: 300,
        outputTokens: 400,
        methodologyId: 'mistral-lca-2026',
      });

      expect(result.impact.energy.operational.epistemicStatus).toBe('modeled');
      expect(result.impact.energy.total.epistemicStatus).toBe('modeled');
      expect(result.impact.water.consumption.total.epistemicStatus).toBe('modeled');
      expect(result.impact.carbon.total.epistemicStatus).toBe('modeled');

      // Crucial epistemic distinction: Mineral depletion is high-uncertainty LCA extrapolation
      expect(result.impact.minerals?.depletion.epistemicStatus).toBe('experimental_modeled');
    });
  });
});
