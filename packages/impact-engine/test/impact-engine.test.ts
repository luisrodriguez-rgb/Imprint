import { describe, it, expect } from 'vitest';
import {
  estimateImpact,
  getMethodology,
  listMethodologies,
  GOOGLE_OPERATIONAL_2025,
  JOULE_FRONTIER_2026,
  MISTRAL_LCA_2026,
} from '../src';

describe('@imprint/impact-engine', () => {
  it('registers all four scientific methodologies independently', () => {
    const list = listMethodologies();
    expect(list).toHaveLength(4);
    expect(list.map((m) => m.id)).toContain('google-operational-2025');
    expect(list.map((m) => m.id)).toContain('joule-frontier-2026');
    expect(list.map((m) => m.id)).toContain('mistral-lca-2026');
    expect(list.map((m) => m.id)).toContain('openai-reference-2025');
  });

  describe('Google Operational 2025 Benchmark', () => {
    it('produces ~0.24 Wh energy and ~0.26 mL direct onsite water for a standard prompt', () => {
      const res = estimateImpact({
        inputTokens: 100,
        outputTokens: 300,
        methodologyId: 'google-operational-2025',
        inputProvenance: 'local_estimation',
        outputProvenance: 'browser_observation',
        modelDetected: true,
      });

      // Expected ~0.24 Wh operational (0.26 Wh total with 1.10 PUE)
      expect(res.impact.energy.operational.expected).toBeCloseTo(0.24, 1);
      expect(res.impact.energy.total.expected).toBeGreaterThan(0.23);
      expect(res.impact.energy.total.expected).toBeLessThan(0.30);

      // Expected direct onsite evaporative water ~0.26 mL
      expect(res.impact.water.consumption.onsite.expected).toBeCloseTo(0.26, 1);

      // Check bounds [min, max]
      expect(res.impact.energy.total.min).toBeLessThan(res.impact.energy.total.expected);
      expect(res.impact.energy.total.max).toBeGreaterThan(res.impact.energy.total.expected);
    });

    it('reproduces the ~5 mL water and ~5 Wh energy order of magnitude for a 20-interaction session', () => {
      let sessionEnergyWh = 0;
      let sessionDirectWaterMl = 0;

      for (let i = 0; i < 20; i++) {
        const res = estimateImpact({
          inputTokens: 120,
          outputTokens: 280,
          methodologyId: 'google-operational-2025',
        });
        sessionEnergyWh += res.impact.energy.total.expected;
        sessionDirectWaterMl += res.impact.water.consumption.onsite.expected;
      }

      // 20 interactions should fall between 4.5 and 6.0 Wh, and 4.8 and 6.5 mL direct water
      expect(sessionEnergyWh).toBeGreaterThanOrEqual(4.5);
      expect(sessionEnergyWh).toBeLessThanOrEqual(6.0);
      expect(sessionDirectWaterMl).toBeGreaterThanOrEqual(4.8);
      expect(sessionDirectWaterMl).toBeLessThanOrEqual(6.5);
    });
  });

  describe('Joule Frontier 2026 Reasoning Scaling', () => {
    it('demonstrates non-linear energy scaling when reasoning tokens are present', () => {
      const standardQuery = estimateImpact({
        inputTokens: 100,
        outputTokens: 300,
        reasoningTokens: 0,
        methodologyId: 'joule-frontier-2026',
      });

      const reasoningQuery = estimateImpact({
        inputTokens: 500,
        outputTokens: 800,
        reasoningTokens: 4000,
        methodologyId: 'joule-frontier-2026',
      });

      // Standard query baseline: ~0.31 Wh
      expect(standardQuery.impact.energy.operational.expected).toBeCloseTo(0.31, 1);

      // Reasoning query with 4000 reasoning tokens scales to > 3 Wh
      expect(reasoningQuery.impact.energy.operational.expected).toBeGreaterThan(3.0);
      expect(reasoningQuery.impact.energy.operational.expected).toBeLessThan(4.5);
    });
  });

  describe('Mistral Cradle-to-Gate LCA 2026', () => {
    it('models cradle-to-gate lifecycle boundaries including water and mineral depletion', () => {
      const res = estimateImpact({
        inputTokens: 100,
        outputTokens: 300,
        methodologyId: 'mistral-lca-2026',
      });

      // For 400 tokens: ~45 mL total lifecycle water, ~1.14 g CO2e, ~0.16 mg Sb-eq
      expect(res.impact.water.consumption.total.expected).toBeCloseTo(45.0, 0);
      expect(res.impact.carbon.total.expected).toBeCloseTo(1.14, 1);
      expect(res.impact.minerals?.depletion.expected).toBeCloseTo(0.16, 2);

      // Upstream water dominates total lifecycle water (unlike pure direct operational cooling)
      expect(res.impact.water.consumption.upstream.expected).toBeGreaterThan(
        res.impact.water.consumption.onsite.expected
      );
    });
  });

  describe('Explainable Confidence & Physical Equivalences', () => {
    it('generates an explainable confidence assessment with passed checklist items', () => {
      const res = estimateImpact({
        inputTokens: 250,
        outputTokens: 500,
        modelFamily: 'gpt-4o',
        modelDetected: true,
        outputProvenance: 'browser_observation',
        inputProvenance: 'local_estimation',
      });

      expect(res.confidence.level).toBe('MEDIUM');
      expect(res.confidence.score).toBeGreaterThanOrEqual(50);
      expect(res.confidence.checklist.find((c) => c.id === 'model-detection')?.passed).toBe(true);
      expect(res.confidence.checklist.find((c) => c.id === 'output-length')?.passed).toBe(true);
    });

    it('generates honest physical equivalences with clearly declared baseline assumptions', () => {
      const res = estimateImpact({
        inputTokens: 250,
        outputTokens: 500,
      });

      expect(res.equivalences.length).toBeGreaterThanOrEqual(4);
      const phoneEq = res.equivalences.find((e) => e.id === 'smartphone_battery_pct');
      expect(phoneEq).toBeDefined();
      expect(phoneEq?.baselineAssumption).toContain('12–15 Wh');
      expect(phoneEq?.displayText).toMatch(/≈ \d+–\d+%/);

      const espressoEq = res.equivalences.find((e) => e.id === 'espresso_shots');
      expect(espressoEq).toBeDefined();
      expect(espressoEq?.baselineAssumption).toContain('30 mL');
    });
  });
});
