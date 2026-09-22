import {
  ConfidenceAssessment,
  DataProvenance,
  ImpactResult,
  InferenceGeography,
  Methodology,
  PhysicalEquivalence,
} from '@imprint/schemas';
import { calculateEnergy } from './calculators/energy';
import { calculateWater } from './calculators/water';
import { calculateCarbon } from './calculators/carbon';
import { calculateMineralDepletion } from './calculators/minerals';
import { evaluateConfidence } from './calculators/confidence';
import { generatePhysicalEquivalences } from './calculators/equivalences';
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
}

export function estimateImpact(input: ImpactEngineInput): ImpactEngineOutput {
  const methodology = getMethodology(input.methodologyId || DEFAULT_METHODOLOGY_ID);

  const energy = calculateEnergy({
    inputTokens: input.inputTokens,
    outputTokens: input.outputTokens,
    reasoningTokens: input.reasoningTokens,
    reasoningIncludedInOutput: input.reasoningIncludedInOutput,
    modelFamily: input.modelFamily,
    methodology,
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
    gridCarbonIntensityGPerKwh: input.gridCarbonIntensityGPerKwh,
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
  };
}
