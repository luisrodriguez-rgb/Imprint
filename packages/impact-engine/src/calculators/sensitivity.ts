import { Methodology, SensitivityContribution } from '@imprint/schemas';

export interface SensitivityAnalysisParams {
  operationalWh: number;
  totalEnergyWh: number;
  pue: number;
  gridCarbonIntensityGPerKwh: number;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;
  methodology: Methodology;
  geographyKnown: boolean;
}

/**
 * Conducts scientific sensitivity analysis determining what proportion of total model uncertainty
 * is attributed to infrastructure parameters (PUE, grid intensity) versus model workload (tokens).
 */
export function analyzeSensitivity(params: SensitivityAnalysisParams): SensitivityContribution[] {
  const {
    operationalWh,
    totalEnergyWh,
    pue,
    gridCarbonIntensityGPerKwh,
    methodology,
    geographyKnown,
  } = params;

  const contributions: SensitivityContribution[] = [];
  const energyVariancePct = methodology.uncertaintyModel.energyVariancePct;

  // --------------------------------------------------------------------------
  // 1. Energy Sensitivity: PUE Facility Overhead vs. Model Workload
  // --------------------------------------------------------------------------
  const pueMin = 1.08; // State-of-the-art free-cooling hyperscale
  const pueMax = 1.45; // Mixed / colocation / warmer ambient facility
  const deltaPueWh = operationalWh * (pueMax - pueMin);

  // Workload variance from token distribution and hardware silicon variance
  const deltaWorkloadWh = totalEnergyWh * (energyVariancePct / 100) * 2;
  const totalEnergyUncertaintySpan = Math.max(0.0001, deltaPueWh + deltaWorkloadWh);

  const pueEnergySharePct = Math.round((deltaPueWh / totalEnergyUncertaintySpan) * 1000) / 10;
  const workloadEnergySharePct = Math.round((100 - pueEnergySharePct) * 10) / 10;

  contributions.push({
    parameter: 'pue',
    baselineValue: pue,
    perturbedMin: pueMin,
    perturbedMax: pueMax,
    impactOnMetric: 'energy_wh',
    varianceSharePct: pueEnergySharePct,
    description: `Datacenter facility efficiency (PUE range ${pueMin}–${pueMax}) explains ${pueEnergySharePct}% of energy uncertainty`,
  });

  contributions.push({
    parameter: 'workload_token_inference',
    baselineValue: operationalWh,
    perturbedMin: operationalWh * (1 - energyVariancePct / 100),
    perturbedMax: operationalWh * (1 + energyVariancePct / 100),
    impactOnMetric: 'energy_wh',
    varianceSharePct: workloadEnergySharePct,
    description: `Model workload and hardware variance (±${energyVariancePct}%) explains ${workloadEnergySharePct}% of energy uncertainty`,
  });

  // --------------------------------------------------------------------------
  // 2. Carbon Sensitivity: Geographic Grid Mix vs. Energy Consumption
  // --------------------------------------------------------------------------
  const gridMin = geographyKnown ? gridCarbonIntensityGPerKwh * (1 - methodology.uncertaintyModel.carbonVariancePct / 100) : 160;
  const gridMax = geographyKnown ? gridCarbonIntensityGPerKwh * (1 + methodology.uncertaintyModel.carbonVariancePct / 100) : 580;

  const energyKwh = totalEnergyWh / 1000;
  const deltaGridCarbonG = energyKwh * (gridMax - gridMin);
  const deltaEnergyCarbonG = (deltaWorkloadWh / 1000) * gridCarbonIntensityGPerKwh;
  const totalCarbonUncertaintySpan = Math.max(0.0001, deltaGridCarbonG + deltaEnergyCarbonG);

  const gridCarbonSharePct = Math.round((deltaGridCarbonG / totalCarbonUncertaintySpan) * 1000) / 10;
  const energyCarbonSharePct = Math.round((100 - gridCarbonSharePct) * 10) / 10;

  contributions.push({
    parameter: 'grid_carbon_intensity',
    baselineValue: gridCarbonIntensityGPerKwh,
    perturbedMin: gridMin,
    perturbedMax: gridMax,
    impactOnMetric: 'carbon_g',
    varianceSharePct: gridCarbonSharePct,
    description: geographyKnown
      ? `Local grid hourly variance explains ${gridCarbonSharePct}% of carbon uncertainty`
      : `Datacenter geographic routing uncertainty (160–580 g/kWh scenario span) explains ${gridCarbonSharePct}% of carbon uncertainty`,
  });

  contributions.push({
    parameter: 'energy_consumption_carbon',
    baselineValue: totalEnergyWh,
    perturbedMin: totalEnergyWh * (1 - energyVariancePct / 100),
    perturbedMax: totalEnergyWh * (1 + energyVariancePct / 100),
    impactOnMetric: 'carbon_g',
    varianceSharePct: energyCarbonSharePct,
    description: `Computation energy variance explains ${energyCarbonSharePct}% of carbon footprint uncertainty`,
  });

  return contributions;
}
