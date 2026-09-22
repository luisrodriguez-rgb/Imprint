import { EnergyMetrics, Methodology } from '@imprint/schemas';
import { createMetricValue } from './uncertainty';

export interface EnergyCalculationParams {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;
  reasoningIncludedInOutput?: boolean | 'unknown';
  modelFamily?: string | null;
  methodology: Methodology;
}

export function calculateEnergy(params: EnergyCalculationParams): EnergyMetrics {
  const {
    inputTokens,
    outputTokens,
    reasoningTokens = 0,
    reasoningIncludedInOutput = 'unknown',
    methodology,
  } = params;
  const variance = methodology.uncertaintyModel.energyVariancePct;

  let operationalWh = 0;
  let pue = 1.12; // Default modern hyperscale PUE

  switch (methodology.id) {
    case 'google-operational-2025': {
      // Google 2025: 0.24 Wh reported median text prompt.
      // Scaling with tokens relative to ~400 token median prompt (approx 100 in, 300 out)
      const basePromptWh = 0.24;
      const normalizedRatio = (inputTokens * 0.25 + outputTokens * 0.75) / (100 * 0.25 + 300 * 0.75);
      // Scaled operational Wh with floor to prevent 0 Wh on small queries
      operationalWh = Math.max(0.05, basePromptWh * Math.max(0.3, normalizedRatio));
      pue = 1.10;
      break;
    }

    case 'joule-frontier-2026': {
      // Joule 2026: Distinct prefill, decode, and deep reasoning coefficients
      // Prefill: ~0.00003 Wh/token
      // Decode: ~0.00028 Wh/token
      // Reasoning: ~0.00072 Wh/token (intensive search / chain-of-thought)
      // Epistemic fix: Prevent double counting when reasoning tokens are already bundled inside outputTokens
      let pureDecodeTokens = outputTokens;
      if (reasoningIncludedInOutput === true) {
        pureDecodeTokens = Math.max(0, outputTokens - reasoningTokens);
      } else if (reasoningIncludedInOutput === 'unknown' && outputTokens >= reasoningTokens && reasoningTokens > 0) {
        // Conservative deduplication to prevent model inflation
        pureDecodeTokens = Math.max(0, outputTokens - reasoningTokens);
      }

      const prefillWh = inputTokens * 0.00003;
      const decodeWh = pureDecodeTokens * 0.00028;
      const reasoningWh = reasoningTokens * 0.00072;
      const baseSystemOverheadWh = 0.22; // Static hardware & host power allocation
      operationalWh = baseSystemOverheadWh + prefillWh + decodeWh + reasoningWh;
      pue = 1.12;
      break;
    }

    case 'mistral-lca-2026': {
      // 45 mL and 1.14 g CO2e / 400 tokens implies ~0.38 Wh operational electrical equivalent
      const ratio = (inputTokens + outputTokens) / 400;
      operationalWh = Math.max(0.08, 0.38 * Math.max(0.25, ratio));
      pue = 1.15;
      break;
    }

    case 'openai-reference-2025':
    default: {
      // Altman 2025: 0.34 Wh average query
      const baseWh = 0.34;
      const tokenRatio = (inputTokens * 0.2 + outputTokens * 0.8) / 350;
      operationalWh = Math.max(0.06, baseWh * Math.max(0.3, tokenRatio));
      pue = 1.12;
      break;
    }
  }

  const pueOverheadWh = operationalWh * (pue - 1.0);
  const totalWh = operationalWh * pue;

  return {
    operational: createMetricValue(
      operationalWh,
      variance,
      'Wh',
      'methodology_model',
      'operational',
      3
    ),
    datacenterPueOverhead: createMetricValue(
      pueOverheadWh,
      variance,
      'Wh',
      'methodology_model',
      'datacenter',
      3
    ),
    total: createMetricValue(
      totalWh,
      variance,
      'Wh',
      'methodology_model',
      'datacenter',
      3
    ),
  };
}
