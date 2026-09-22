import { BoundType, DataProvenance, EpistemicStatus, ImpactScope, MetricValue } from '@imprint/schemas';

/**
 * Creates a bounded MetricValue with [min, expected, max] based on a central value,
 * a methodology-defined variance percentage or explicit bounds override,
 * an explicit epistemic status, and formal bound categorization (scenario vs variance).
 */
export function createMetricValue(
  expected: number,
  variancePct: number,
  unit: string,
  provenance: DataProvenance,
  scope: ImpactScope,
  decimals: number = 2,
  epistemicStatus: EpistemicStatus = 'modeled',
  boundsOverride?: { min: number; max: number },
  boundType?: BoundType,
  boundSource?: string
): MetricValue {
  const round = (val: number) => {
    const p = Math.pow(10, decimals);
    return Math.round(val * p) / p;
  };

  let min: number;
  let max: number;

  if (boundsOverride) {
    min = Math.max(0, boundsOverride.min);
    max = Math.max(min, boundsOverride.max);
  } else {
    const factor = Math.max(0, variancePct) / 100;
    min = Math.max(0, expected * (1 - factor));
    max = expected * (1 + factor);
  }

  return {
    min: round(min),
    expected: round(expected),
    max: round(max),
    unit,
    provenance,
    scope,
    epistemicStatus,
    boundType: boundType ?? (boundsOverride ? 'scenario' : 'methodology_variance'),
    boundSource,
  };
}


