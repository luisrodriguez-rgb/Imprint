import { Methodology, WaterMetrics } from '@imprint/schemas';
import { createMetricValue } from './uncertainty';

export interface WaterCalculationParams {
  totalEnergyWh: number;
  inputTokens: number;
  outputTokens: number;
  methodology: Methodology;
  providerId?: string;
}

export function calculateWater(params: WaterCalculationParams): WaterMetrics {
  const { totalEnergyWh, inputTokens, outputTokens, methodology } = params;
  const variance = methodology.uncertaintyModel.waterVariancePct;

  let onsiteConsumptionMl = 0;
  let upstreamConsumptionMl = 0;
  let onsiteWithdrawalMl = 0;
  let upstreamWithdrawalMl = 0;

  switch (methodology.id) {
    case 'google-operational-2025': {
      // Google: 0.26 mL direct onsite water per 0.24 Wh prompt
      // Direct WUE implied: 0.26 mL / 0.24 Wh = 1.08 L/kWh onsite evaporative water
      onsiteConsumptionMl = totalEnergyWh * 1.08;
      // Google 2025 operational benchmark scope excludes upstream grid water,
      // but upstream standard thermoelectric grid consumption factor is ~1.5 mL/Wh
      upstreamConsumptionMl = totalEnergyWh * 1.50;
      onsiteWithdrawalMl = onsiteConsumptionMl * 1.35; // ~35% blowdown/drainage
      upstreamWithdrawalMl = totalEnergyWh * 12.0;    // Standard grid cooling withdrawal
      break;
    }

    case 'mistral-lca-2026': {
      // Mistral LCA: 45 mL total lifecycle water per ~400 tokens
      const tokenRatio = (inputTokens + outputTokens) / 400;
      const totalLifecycleWaterMl = Math.max(5.0, 45.0 * Math.max(0.2, tokenRatio));
      // In LCA, onsite evaporative cooling is ~15%, upstream thermoelectric power water is ~60%, supply chain is ~25%
      onsiteConsumptionMl = totalLifecycleWaterMl * 0.15;
      upstreamConsumptionMl = totalLifecycleWaterMl * 0.85;
      onsiteWithdrawalMl = onsiteConsumptionMl * 1.4;
      upstreamWithdrawalMl = totalLifecycleWaterMl * 3.5;
      break;
    }

    case 'openai-reference-2025': {
      // Altman reference: 0.000085 gallons = ~0.32 mL for 0.34 Wh query
      // Microsoft Azure reported average WUE is ~0.27 L/kWh (0.27 mL/Wh)
      onsiteConsumptionMl = totalEnergyWh * 0.27;
      upstreamConsumptionMl = totalEnergyWh * 1.60;
      onsiteWithdrawalMl = onsiteConsumptionMl * 1.5;
      upstreamWithdrawalMl = totalEnergyWh * 14.0;
      break;
    }

    case 'joule-frontier-2026':
    default: {
      // Industry average datacenter WUE: ~0.30 L/kWh (0.30 mL/Wh)
      onsiteConsumptionMl = totalEnergyWh * 0.30;
      // Average US/EU electric grid water consumption: ~1.8 L/kWh (1.8 mL/Wh)
      upstreamConsumptionMl = totalEnergyWh * 1.80;
      onsiteWithdrawalMl = onsiteConsumptionMl * 1.6;
      upstreamWithdrawalMl = totalEnergyWh * 15.0; // Gross withdrawal before return to water body
      break;
    }
  }

  const totalConsumptionMl = onsiteConsumptionMl + upstreamConsumptionMl;
  const totalWithdrawalMl = onsiteWithdrawalMl + upstreamWithdrawalMl;

  return {
    consumption: {
      onsite: createMetricValue(
        onsiteConsumptionMl,
        variance,
        'mL',
        'methodology_model',
        'datacenter',
        3
      ),
      upstream: createMetricValue(
        upstreamConsumptionMl,
        variance,
        'mL',
        'methodology_model',
        'grid',
        3
      ),
      total: createMetricValue(
        totalConsumptionMl,
        variance,
        'mL',
        'methodology_model',
        'grid',
        3
      ),
    },
    withdrawal: {
      onsite: createMetricValue(
        onsiteWithdrawalMl,
        variance,
        'mL',
        'methodology_model',
        'datacenter',
        3
      ),
      upstream: createMetricValue(
        upstreamWithdrawalMl,
        variance,
        'mL',
        'methodology_model',
        'grid',
        3
      ),
      total: createMetricValue(
        totalWithdrawalMl,
        variance,
        'mL',
        'methodology_model',
        'grid',
        3
      ),
    },
  };
}
