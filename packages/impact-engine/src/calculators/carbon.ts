import { CarbonMetrics, InferenceGeography, Methodology } from '@imprint/schemas';
import { createMetricValue } from './uncertainty';

export interface CarbonCalculationParams {
  totalEnergyWh: number;
  inputTokens: number;
  outputTokens: number;
  methodology: Methodology;
  gridCarbonIntensityGPerKwh?: number; // e.g. 380 g CO2e / kWh
  geography?: InferenceGeography;
}

export function calculateCarbon(params: CarbonCalculationParams): CarbonMetrics {
  const {
    totalEnergyWh,
    inputTokens,
    outputTokens,
    methodology,
    gridCarbonIntensityGPerKwh,
    geography,
  } = params;

  const variance = methodology.uncertaintyModel.carbonVariancePct;
  const isGeographyUnknown = !geography || geography.status === 'unknown';

  // Resolved intensity: provider-reported override > explicit param > global default (380 g/kWh)
  const resolvedIntensity =
    geography?.gridCarbonIntensityGPerKwh ??
    gridCarbonIntensityGPerKwh ??
    380;

  let operationalG = 0;
  let embodiedG: number | undefined = undefined;
  let boundsOverride: { min: number; max: number } | undefined = undefined;

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
      const energyKwh = totalEnergyWh / 1000;
      operationalG = energyKwh * resolvedIntensity;

      // When datacenter physical location is unknown, hyperscale fleet variance
      // spans from hydro/nuclear regions (~160 g/kWh) to fossil-peaker grids (~580 g/kWh)
      if (isGeographyUnknown) {
        boundsOverride = {
          min: energyKwh * 160,
          max: energyKwh * 580,
        };
      }
      break;
    }
  }

  const totalG = operationalG + (embodiedG ?? 0);

  const boundType = isGeographyUnknown ? 'scenario' : 'methodology_variance';
  const boundSource = isGeographyUnknown
    ? 'Hyperscale grid scenario interval: low-carbon hydro/nuclear (160 g/kWh) to fossil peaker gas (580 g/kWh)'
    : (geography?.region
        ? `Provider reported region (${geography.region}) with ±${variance}% grid variance`
        : `Methodology baseline grid intensity (${resolvedIntensity} g/kWh) with ±${variance}% variance`);

  return {
    operational: createMetricValue(
      operationalG,
      variance,
      'g CO2e',
      geography?.status === 'provider_reported' ? 'provider_api' : 'methodology_model',
      'grid',
      3,
      'modeled',
      boundsOverride,
      boundType,
      boundSource
    ),
    lifecycleEmbodied: embodiedG !== undefined
      ? createMetricValue(
          embodiedG,
          variance,
          'g CO2e',
          'methodology_model',
          'lifecycle',
          3,
          'modeled',
          undefined,
          'methodology_variance',
          'Supply-chain LCA embodied manufacturing variance'
        )
      : undefined,
    total: createMetricValue(
      totalG,
      variance,
      'g CO2e',
      'methodology_model',
      embodiedG !== undefined ? 'lifecycle' : 'grid',
      3,
      'modeled',
      boundsOverride
        ? {
            min: boundsOverride.min + (embodiedG ? embodiedG * (1 - variance / 100) : 0),
            max: boundsOverride.max + (embodiedG ? embodiedG * (1 + variance / 100) : 0),
          }
        : undefined,
      boundType,
      boundSource
    ),
  };
}
