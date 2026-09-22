import { CarbonMetrics, Methodology } from '@imprint/schemas';
import { createMetricValue } from './uncertainty';

export interface CarbonCalculationParams {
  totalEnergyWh: number;
  inputTokens: number;
  outputTokens: number;
  methodology: Methodology;
  gridCarbonIntensityGPerKwh?: number; // e.g. 380 g CO2e / kWh
}

export function calculateCarbon(params: CarbonCalculationParams): CarbonMetrics {
  const {
    totalEnergyWh,
    inputTokens,
    outputTokens,
    methodology,
    gridCarbonIntensityGPerKwh = 380, // Default average grid carbon intensity
  } = params;

  const variance = methodology.uncertaintyModel.carbonVariancePct;

  let operationalG = 0;
  let embodiedG: number | undefined = undefined;

  switch (methodology.id) {
    case 'mistral-lca-2026': {
      // Mistral LCA reports ~1.14 g CO2e for a 400 token prompt (operational + embodied)
      const tokenRatio = (inputTokens + outputTokens) / 400;
      const totalLcaG = Math.max(0.15, 1.14 * Math.max(0.2, tokenRatio));
      operationalG = totalLcaG * 0.65;
      embodiedG = totalLcaG * 0.35;
      break;
    }

    default: {
      // Energy in kWh = totalEnergyWh / 1000
      // Operational carbon = kWh * grid intensity
      operationalG = (totalEnergyWh / 1000) * gridCarbonIntensityGPerKwh;
      break;
    }
  }

  const totalG = operationalG + (embodiedG ?? 0);

  return {
    operational: createMetricValue(
      operationalG,
      variance,
      'g CO2e',
      'methodology_model',
      'grid',
      3
    ),
    lifecycleEmbodied: embodiedG !== undefined
      ? createMetricValue(
          embodiedG,
          variance,
          'g CO2e',
          'methodology_model',
          'lifecycle',
          3
        )
      : undefined,
    total: createMetricValue(
      totalG,
      variance,
      'g CO2e',
      'methodology_model',
      embodiedG !== undefined ? 'lifecycle' : 'grid',
      3
    ),
  };
}
