import { Methodology } from '@imprint/schemas';

export const MISTRAL_LCA_2026: Methodology = {
  id: 'mistral-lca-2026',
  name: 'Mistral Large 2 Cradle-to-Gate LCA (2026)',
  version: '1.0.0',
  description:
    'Comprehensive Life Cycle Assessment (LCA) conducted by Mistral AI for Mistral Large 2 / Le Chat, encompassing upstream electricity generation water and embodied server manufacturing.',
  boundary: 'cradle-to-gate',
  primaryScope: 'lifecycle',
  methodologyType: 'corporate_disclosure',
  metricsSupported: [
    'energy_wh',
    'water_consumption_ml',
    'water_withdrawal_ml',
    'carbon_g_co2e',
    'mineral_depletion_mg_sbeq',
  ],
  assumptions: [
    'For a standard query of ~400 tokens in Le Chat, total lifecycle impacts are ~45 mL water, ~1.14 g CO2e, and ~0.16 mg Sb-eq.',
    'Water metric includes upstream thermoelectric power generation water withdrawal and cooling, not just onsite data center evaporation.',
    'Mineral depletion captures rare metals and semiconductor materials embedded in GPUs and server chassis (Scope 3 embodiment).',
    'Excludes user client devices (laptops, phones).',
  ],
  sources: [
    {
      id: 'mistral-lca-paper',
      title: 'Our contribution to a global environmental standard for AI: Life Cycle Assessment of Mistral Large 2',
      authors: 'Mistral AI Environmental Research Team',
      year: 2026,
      publisher: 'Mistral AI',
      url: 'https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai/',
      notes: 'Standardized LCA methodology following ISO 14040/14044 and European PEF.',
    },
  ],
  uncertaintyModel: {
    energyVariancePct: 30,
    waterVariancePct: 45,
    carbonVariancePct: 35,
    notes: 'Higher variance due to supply chain tier-2 and tier-3 supplier estimations.',
  },
};
