import { DataProvenance, ImpactScope, MetricValue } from '@imprint/schemas';

/**
 * Creates a bounded MetricValue with [min, expected, max] based on a central value
 * and a methodology-defined variance percentage.
 */
export function createMetricValue(
  expected: number,
  variancePct: number,
  unit: string,
  provenance: DataProvenance,
  scope: ImpactScope,
  decimals: number = 2
): MetricValue {
  const factor = Math.max(0, variancePct) / 100;
  const min = Math.max(0, expected * (1 - factor));
  const max = expected * (1 + factor);

  const round = (val: number) => {
    const p = Math.pow(10, decimals);
    return Math.round(val * p) / p;
  };

  return {
    min: round(min),
    expected: round(expected),
    max: round(max),
    unit,
    provenance,
    scope,
  };
}
