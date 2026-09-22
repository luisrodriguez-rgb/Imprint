export * from './methodologies/registry';
export * from './methodologies/google-operational-2025';
export * from './methodologies/joule-frontier-2026';
export * from './methodologies/mistral-lca-2026';
export * from './methodologies/openai-reference-2025';

export * from './calculators/uncertainty';
export * from './calculators/energy';
export * from './calculators/water';
export * from './calculators/carbon';
export * from './calculators/minerals';
export * from './calculators/confidence';
export * from './calculators/equivalences';

export * from './engine';

import { listMethodologies } from './methodologies/registry';
import { generatePhysicalEquivalences } from './calculators/equivalences';

export const ALL_METHODOLOGIES = listMethodologies();

export function getEquivalences(
  energyWh: number,
  waterConsumptionMl: number,
  carbonG: number
) {
  return generatePhysicalEquivalences({
    energyWh,
    waterConsumptionMl,
    carbonG,
  });
}

