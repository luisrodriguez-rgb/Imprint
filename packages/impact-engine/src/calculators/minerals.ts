import { Methodology, MineralMetrics } from '@imprint/schemas';
import { createMetricValue } from './uncertainty';

export interface MineralCalculationParams {
  inputTokens: number;
  outputTokens: number;
  methodology: Methodology;
}

export function calculateMineralDepletion(
  params: MineralCalculationParams
): MineralMetrics | undefined {
  const { inputTokens, outputTokens, methodology } = params;

  // Only calculate if methodology explicitly supports mineral depletion
  if (!methodology.metricsSupported.includes('mineral_depletion_mg_sbeq')) {
    return undefined;
  }

  // Mistral LCA: ~0.16 mg Sb-eq per 400 tokens (~0.0004 mg Sb-eq per token)
  const tokenRatio = (inputTokens + outputTokens) / 400;
  const mgSbEq = Math.max(0.02, 0.16 * Math.max(0.2, tokenRatio));

  return {
    depletion: createMetricValue(
      mgSbEq,
      50, // ±50% variance for supply-chain mineral estimations
      'mg Sb-eq',
      'methodology_model',
      'lifecycle',
      4
    ),
  };
}
