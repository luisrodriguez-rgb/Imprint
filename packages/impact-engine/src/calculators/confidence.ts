import {
  ConfidenceAssessment,
  ConfidenceChecklistItem,
  ConfidenceLevel,
  DataProvenance,
} from '@imprint/schemas';

export interface ConfidenceEvaluationParams {
  modelDetected: boolean;
  outputObserved: boolean;
  inputProvenance: DataProvenance;
  outputProvenance: DataProvenance;
  datacenterKnown?: boolean;
}

export function evaluateConfidence(
  params: ConfidenceEvaluationParams
): ConfidenceAssessment {
  const {
    modelDetected,
    outputObserved,
    inputProvenance,
    outputProvenance,
    datacenterKnown = false,
  } = params;

  const checklist: ConfidenceChecklistItem[] = [
    {
      id: 'model-detection',
      title: 'Model Identity Detected',
      status: modelDetected ? 'verified' : 'inferred',
      passed: modelDetected,
      description: modelDetected
        ? 'Model name and family identified directly from active interface'
        : 'Model unknown; using generic frontier LLM parameters',
    },
    {
      id: 'output-length',
      title: 'Output Length Observed',
      status: outputProvenance === 'browser_observation' ? 'verified' : 'inferred',
      passed: outputObserved,
      description: outputObserved
        ? 'Assistant response completion and token length observed in browser'
        : 'Output length inferred from average interaction heuristics',
    },
    {
      id: 'input-tokens',
      title: 'Input Token Accounting',
      status: inputProvenance === 'provider_api' ? 'verified' : 'inferred',
      passed: inputProvenance === 'provider_api',
      description:
        inputProvenance === 'provider_api'
          ? 'Exact prompt token count verified via provider'
          : 'Estimated client-side from character ratios (privacy-first: zero text stored)',
    },
    {
      id: 'datacenter-location',
      title: 'Datacenter Region & Thermal Specs',
      status: datacenterKnown ? 'verified' : 'assumed',
      passed: datacenterKnown,
      description: datacenterKnown
        ? 'Datacenter location and local cooling efficiency verified'
        : 'Datacenter location unspecified; using provider fleet average WUE & PUE',
    },
  ];

  let score = 20; // Baseline floor
  if (modelDetected) score += 25;
  if (outputObserved) score += 20;
  if (inputProvenance === 'provider_api' || inputProvenance === 'provider_export') score += 25;
  if (datacenterKnown) score += 10;

  let level: ConfidenceLevel = 'LOW';
  let summary = '';

  if (score >= 70) {
    level = 'HIGH';
    summary = 'Strong observational fidelity: Model and output length observed directly.';
  } else if (score >= 50) {
    level = 'MEDIUM';
    summary = 'Moderate fidelity: Output observed in browser; input tokens estimated from character ratios.';
  } else {
    level = 'LOW';
    summary = 'Low fidelity: Inferred from generic frontier baseline; model or output not directly verified.';
  }

  return {
    level,
    score,
    summary,
    checklist,
  };
}
