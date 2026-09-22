import {
  CalculationStep,
  CalculationTrace,
  EpistemicBucket,
  Methodology,
  SensitivityContribution,
  SystemParameters,
} from '@imprint/schemas';

export interface BuildTraceParams {
  id?: string;
  timestamp?: number;
  methodology: Methodology;
  parameters: SystemParameters;
  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;
  reasoningIncludedInOutput?: boolean | 'unknown';
  operationalWh: number;
  totalEnergyWh: number;
  onsiteWaterMl: number;
  upstreamWaterMl: number;
  operationalCarbonG: number;
  epistemic: EpistemicBucket;
  sensitivity?: SensitivityContribution[];
}

/**
 * Builds a transparent, step-by-step CalculationTrace that makes every calculation
 * in Imprint fully auditable, reproducible, and verifiable.
 */
export function buildCalculationTrace(params: BuildTraceParams): CalculationTrace {
  const {
    id = `trace-${Date.now()}`,
    timestamp = Date.now(),
    methodology,
    parameters,
    inputTokens,
    outputTokens,
    reasoningTokens = 0,
    reasoningIncludedInOutput = 'unknown',
    operationalWh,
    totalEnergyWh,
    onsiteWaterMl,
    upstreamWaterMl,
    operationalCarbonG,
    epistemic,
    sensitivity,
  } = params;

  const steps: CalculationStep[] = [];

  // Step 1: Token Accounting
  steps.push({
    stepNumber: 1,
    name: 'Token Accounting & Provenance',
    formula: 'Input Tokens + Output Tokens + Reasoning Tokens',
    inputValues: {
      inputTokens,
      outputTokens,
      reasoningTokens,
      reasoningIncludedInOutput,
    },
    resultValue: inputTokens + outputTokens + (reasoningIncludedInOutput === false ? reasoningTokens : 0),
    resultUnit: 'tokens',
    epistemicType: 'estimated',
    notes: reasoningIncludedInOutput === true
      ? 'Reasoning tokens deduplicated from output tokens to prevent model inflation'
      : 'Standard token boundary accounting',
  });

  // Step 2: Operational Hardware Power
  steps.push({
    stepNumber: 2,
    name: 'Operational Silicon Power',
    formula: `Methodology model [${methodology.id}] operational inference equation`,
    inputValues: {
      methodologyId: methodology.id,
      inputTokens,
      outputTokens,
      reasoningTokens,
    },
    resultValue: Math.round(operationalWh * 1000) / 1000,
    resultUnit: 'Wh',
    epistemicType: 'modeled',
    notes: `Derived from published literature coefficients (${methodology.name})`,
  });

  // Step 3: Datacenter Facility Overhead (PUE)
  const pueOverheadWh = totalEnergyWh - operationalWh;
  steps.push({
    stepNumber: 3,
    name: 'Datacenter Facility Overhead (PUE)',
    formula: 'operationalWh * (PUE - 1.0)',
    inputValues: {
      operationalWh: Math.round(operationalWh * 1000) / 1000,
      pue: parameters.pue,
    },
    resultValue: Math.round(pueOverheadWh * 1000) / 1000,
    resultUnit: 'Wh',
    epistemicType: 'assumed',
    notes: `Assumed facility PUE = ${parameters.pue} based on ${parameters.scenarioName} infrastructure profile`,
  });

  // Step 4: Total Electrical Energy
  steps.push({
    stepNumber: 4,
    name: 'Total Electrical Energy',
    formula: 'operationalWh * PUE',
    inputValues: {
      operationalWh: Math.round(operationalWh * 1000) / 1000,
      pue: parameters.pue,
    },
    resultValue: Math.round(totalEnergyWh * 1000) / 1000,
    resultUnit: 'Wh',
    epistemicType: 'modeled',
  });

  // Step 5: Dual Water Consumption (Onsite + Upstream)
  steps.push({
    stepNumber: 5,
    name: 'Dual Water Consumption',
    formula: 'onsite (totalEnergyWh * WUE) + upstream (totalEnergyWh * EWIF)',
    inputValues: {
      totalEnergyWh: Math.round(totalEnergyWh * 1000) / 1000,
      wueLPerKwh: parameters.wueLPerKwh,
      ewifLPerKwh: parameters.ewifLPerKwh,
    },
    resultValue: Math.round((onsiteWaterMl + upstreamWaterMl) * 1000) / 1000,
    resultUnit: 'mL',
    epistemicType: 'modeled',
    notes: `Onsite evaporative cooling: ${Math.round(onsiteWaterMl * 1000) / 1000} mL | Upstream thermoelectric grid water: ${Math.round(upstreamWaterMl * 1000) / 1000} mL`,
  });

  // Step 6: Grid Carbon Footprint
  steps.push({
    stepNumber: 6,
    name: 'Grid Operational Carbon',
    formula: '(totalEnergyWh / 1000) * gridCarbonIntensityGPerKwh',
    inputValues: {
      totalEnergyWh: Math.round(totalEnergyWh * 1000) / 1000,
      gridCarbonIntensityGPerKwh: parameters.gridCarbonIntensityGPerKwh,
    },
    resultValue: Math.round(operationalCarbonG * 1000) / 1000,
    resultUnit: 'g CO2e',
    epistemicType: 'modeled',
    notes: `Evaluated at ${parameters.gridCarbonIntensityGPerKwh} g CO2e/kWh under ${parameters.scenarioName} scenario`,
  });

  return {
    id,
    timestamp,
    methodology,
    parameters,
    steps,
    epistemic,
    sensitivity,
  };
}
