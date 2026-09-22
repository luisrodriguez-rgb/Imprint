import {
  ConfidenceAssessment,
  ConfidenceChecklistItem,
  ConfidenceLevel,
  DataProvenance,
  EpistemicBucket,
  InferenceGeography,
} from '@imprint/schemas';

export interface ConfidenceEvaluationParams {
  modelDetected: boolean;
  outputObserved: boolean;
  inputProvenance: DataProvenance;
  outputProvenance: DataProvenance;
  datacenterKnown?: boolean;
  geography?: InferenceGeography;
  reasoningProvenance?: string;
  reasoningIncludedInOutput?: boolean | 'unknown';
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
    geography,
    reasoningProvenance,
    reasoningIncludedInOutput,
  } = params;

  const isGeoKnown = datacenterKnown || (geography && geography.status === 'provider_reported');

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
      status: isGeoKnown ? 'verified' : 'unknown',
      passed: Boolean(isGeoKnown),
      description: isGeoKnown
        ? `Datacenter location verified${geography?.region ? ` (${geography.region})` : ''}`
        : 'Datacenter location unspecified; decoupling user location from unknown inference grid',
    },
  ];

  let score = 20; // Baseline floor
  if (modelDetected) score += 25;
  if (outputObserved) score += 20;
  if (inputProvenance === 'provider_api' || inputProvenance === 'provider_export') score += 25;
  if (isGeoKnown) score += 10;

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

  // Construct epistemic transparency buckets
  const observed: string[] = ['DOM character counts and response stream completion'];
  if (modelDetected) observed.push('Interface model badge/indicator observed');
  if (outputObserved) observed.push('Assistant response completion event captured');

  const estimated: string[] = ['Operational energy consumption (Wh) modeled from scientific coefficients'];
  if (inputProvenance !== 'provider_api') estimated.push('Input prompt tokens estimated client-side from character ratios');
  if (outputProvenance !== 'provider_api') estimated.push('Output tokens estimated client-side from character lengths');
  if (reasoningProvenance === 'estimated') estimated.push('Reasoning tokens estimated client-side');

  const assumed: string[] = [
    'Hyperscale datacenter operational PUE efficiency (1.10 - 1.15)',
    'Datacenter fleet-average Water Usage Effectiveness (WUE)',
  ];
  if (!isGeoKnown) assumed.push('Regional grid carbon intensity baseline (380 g CO2e/kWh)');

  const unknown: string[] = [
    'Real-time datacenter cooling mode (evaporative vs adiabatic vs dry chillers)',
    'Dynamic GPU cluster concurrency and idle power allocation',
  ];
  if (!isGeoKnown) unknown.push('Exact physical datacenter facility and host machine location');
  if (reasoningIncludedInOutput === 'unknown') unknown.push('Exact provider bundling of internal reasoning tokens');

  const epistemic: EpistemicBucket = {
    observed,
    estimated,
    assumed,
    unknown,
  };

  return {
    level,
    score,
    summary,
    checklist,
    epistemic,
  };
}
