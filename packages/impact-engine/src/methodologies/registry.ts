import { Methodology } from '@imprint/schemas';
import { GOOGLE_OPERATIONAL_2025 } from './google-operational-2025';
import { JOULE_FRONTIER_2026 } from './joule-frontier-2026';
import { MISTRAL_LCA_2026 } from './mistral-lca-2026';
import { OPENAI_REFERENCE_2025 } from './openai-reference-2025';

export const METHODOLOGY_REGISTRY: Record<string, Methodology> = {
  [JOULE_FRONTIER_2026.id]: JOULE_FRONTIER_2026,
  [GOOGLE_OPERATIONAL_2025.id]: GOOGLE_OPERATIONAL_2025,
  [OPENAI_REFERENCE_2025.id]: OPENAI_REFERENCE_2025,
  [MISTRAL_LCA_2026.id]: MISTRAL_LCA_2026,
};

export const DEFAULT_METHODOLOGY_ID = JOULE_FRONTIER_2026.id;

export function getMethodology(id: string = DEFAULT_METHODOLOGY_ID): Methodology {
  const method = METHODOLOGY_REGISTRY[id];
  if (!method) {
    throw new Error(
      `Unknown methodology ID: "${id}". Available: ${Object.keys(METHODOLOGY_REGISTRY).join(', ')}`
    );
  }
  return method;
}

export function listMethodologies(): Methodology[] {
  return Object.values(METHODOLOGY_REGISTRY);
}
