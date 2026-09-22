import {
  CalculationTrace,
  ConfidenceAssessment,
  DataProvenance,
  ImpactResult,
  InferenceGeography,
  Methodology,
  PhysicalEquivalence,
  SensitivityContribution,
  SystemParameters,
} from '@imprint/schemas';
import { calculateEnergy } from './calculators/energy';
import { calculateWater } from './calculators/water';
import { calculateCarbon } from './calculators/carbon';
import { calculateMineralDepletion } from './calculators/minerals';
import { evaluateConfidence } from './calculators/confidence';
import { generatePhysicalEquivalences } from './calculators/equivalences';
import { analyzeSensitivity } from './calculators/sensitivity';
import { buildCalculationTrace } from './calculators/trace';
import { resolveParameters } from './parameters/presets';
import { DEFAULT_METHODOLOGY_ID, getMethodology } from './methodologies/registry';

export interface ImpactEngineInput {
  inputTokens: number;
  outputTokens: number;
  reasoningTokens?: number;
  reasoningIncludedInOutput?: boolean | 'unknown';
  reasoningProvenance?: 'provider_reported' | 'provider_export' | 'estimated' | 'unknown';
  modelFamily?: string | null;
  providerId?: string;
  methodologyId?: string;
  parameters?: Partial<SystemParameters>;
  gridCarbonIntensityGPerKwh?: number;
  geography?: InferenceGeography;
  inputProvenance?: DataProvenance;
  outputProvenance?: DataProvenance;
  modelDetected?: boolean;
}

export interface ImpactEngineOutput {
  impact: ImpactResult;
  confidence: ConfidenceAssessment;
  equivalences: PhysicalEquivalence[];
  methodology: Methodology;
  parameters: SystemParameters;
  trace: CalculationTrace;
  sensitivity: SensitivityContribution[];
}

export function estimateImpact(input: ImpactEngineInput): ImpactEngineOutput {
  const methodology = getMethodology(input.methodologyId || DEFAULT_METHODOLOGY_ID);

  const parameters = resolveParameters(methodology, {
    ...input.parameters,
    gridCarbonIntensityGPerKwh:
      input.parameters?.gridCarbonIntensityGPerKwh ?? input.gridCarbonIntensityGPerKwh,
  });

  const energy = calculateEnergy({
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    reasoningTokens: input.reasoningTokens,
    reasoningIncludedInOutput: input.reasoningIncludedInOutput,
    modelFamily: input.modelFamily,
    methodology,
    pue: parameters.pue,
  });

  const water = calculateWater({
    totalEnergyWh: energy.total.expected,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    methodology,
    providerId: input.providerId,
  });

  const carbon = calculateCarbon({
    totalEnergyWh: energy.total.expected,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    methodology,
    gridCarbonIntensityGPerKwh: parameters.gridCarbonIntensityGPerKwh,
    geography: input.geography,
  });

  const minerals = calculateMineralDepletion({
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    methodology,
  });

  const confidence = evaluateConfidence({
    modelDetected: input.modelDetected ?? (input.modelFamily !== null && input.modelFamily !== undefined),
    outputObserved: input.outputProvenance === 'browser_observation',
    inputProvenance: input.inputProvenance || 'local_estimation',
    outputProvenance: input.outputProvenance || 'browser_observation',
    geography: input.geography,
    reasoningProvenance: input.reasoningProvenance,
    reasoningIncludedInOutput: input.reasoningIncludedInOutput,
  });

  const equivalences = generatePhysicalEquivalences({
    energyWh: energy.total.expected,
    waterConsumptionMl: water.consumption.total.expected,
    carbonG: carbon.total.expected,
  });

  const sensitivity = analyzeSensitivity({
    operationalWh: energy.operational.expected,
    totalEnergyWh: energy.total.expected,
    pue: parameters.pue,
    gridCarbonIntensityGPerKwh: parameters.gridCarbonIntensityGPerKwh,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    reasoningTokens: input.reasoningTokens,
    methodology,
    geographyKnown: Boolean(input.geography && input.geography.status === 'provider_reported'),
  });

  const trace = buildCalculationTrace({
    methodology,
    parameters,
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    reasoningTokens: input.reasoningTokens,
    reasoningIncludedInOutput: input.reasoningIncludedInOutput,
    operationalWh: energy.operational.expected,
    totalEnergyWh: energy.total.expected,
    onsiteWaterMl: water.consumption.onsite.expected,
    upstreamWaterMl: water.consumption.upstream.expected,
    operationalCarbonG: carbon.operational.expected,
    epistemic: confidence.epistemic ?? { observed: [], estimated: [], assumed: [], unknown: [] },
    sensitivity,
  });

  return {
    impact: {
      methodologyId: methodology.id,
      methodologyVersion: methodology.version,
      energy,
      water,
      carbon,
      minerals,
    },
    confidence,
    equivalences,
    methodology,
    parameters,
    trace,
    sensitivity,
  };
}
