import { Methodology, SystemParameters } from '@imprint/schemas';

export const DEFAULT_HYPERSCALE_PARAMS: SystemParameters = {
  pue: 1.12,
  gridCarbonIntensityGPerKwh: 380,
  wueLPerKwh: 0.30,
  ewifLPerKwh: 1.80,
  coolingTechnology: 'unspecified_hyperscale_average',
  scenarioName: 'baseline_hyperscale',
};

export const NORDIC_CLEAN_PARAMS: SystemParameters = {
  pue: 1.08,
  gridCarbonIntensityGPerKwh: 45, // Hydro, wind, and nuclear mix (e.g. Sweden/Norway)
  wueLPerKwh: 0.10, // Outside air free economizer
  ewifLPerKwh: 0.80,
  coolingTechnology: 'adiabatic_dry_cooler',
  scenarioName: 'nordic_clean_hydro',
};

export const FOSSIL_HEAVY_PARAMS: SystemParameters = {
  pue: 1.25,
  gridCarbonIntensityGPerKwh: 580, // Coal and natural gas peakers
  wueLPerKwh: 0.85, // Evaporative cooling in hot arid climate
  ewifLPerKwh: 3.50,
  coolingTechnology: 'evaporative_cooling_tower',
  scenarioName: 'fossil_marginal_peaker',
};

export const LEGACY_FACILITY_PARAMS: SystemParameters = {
  pue: 1.55, // Enterprise on-prem or older colocation datacenter
  gridCarbonIntensityGPerKwh: 450,
  wueLPerKwh: 1.20,
  ewifLPerKwh: 2.20,
  coolingTechnology: 'chilled_water_system',
  scenarioName: 'legacy_enterprise_facility',
};

export const PARAMETER_PRESETS: Record<string, SystemParameters> = {
  baseline_hyperscale: DEFAULT_HYPERSCALE_PARAMS,
  nordic_clean_hydro: NORDIC_CLEAN_PARAMS,
  fossil_marginal_peaker: FOSSIL_HEAVY_PARAMS,
  legacy_enterprise_facility: LEGACY_FACILITY_PARAMS,
};

/**
 * Resolves system parameters by combining methodology assumptions with optional explicit user/scenario overrides.
 */
export function resolveParameters(
  methodology: Methodology,
  overrides?: Partial<SystemParameters>
): SystemParameters {
  // Extract methodology-specific defaults if known
  let methodologyPue = DEFAULT_HYPERSCALE_PARAMS.pue;
  let methodologyWue = DEFAULT_HYPERSCALE_PARAMS.wueLPerKwh;

  if (methodology.id === 'google-operational-2025') {
    methodologyPue = 1.10;
    methodologyWue = 1.08;
  } else if (methodology.id === 'mistral-lca-2026') {
    methodologyPue = 1.15;
    methodologyWue = 0.25;
  } else if (methodology.id === 'openai-reference-2025') {
    methodologyPue = 1.12;
    methodologyWue = 0.27;
  }

  return {
    pue: overrides?.pue ?? methodologyPue,
    gridCarbonIntensityGPerKwh:
      overrides?.gridCarbonIntensityGPerKwh ?? DEFAULT_HYPERSCALE_PARAMS.gridCarbonIntensityGPerKwh,
    wueLPerKwh: overrides?.wueLPerKwh ?? methodologyWue,
    ewifLPerKwh: overrides?.ewifLPerKwh ?? DEFAULT_HYPERSCALE_PARAMS.ewifLPerKwh,
    coolingTechnology: overrides?.coolingTechnology ?? DEFAULT_HYPERSCALE_PARAMS.coolingTechnology,
    scenarioName: overrides?.scenarioName ?? DEFAULT_HYPERSCALE_PARAMS.scenarioName,
  };
}
