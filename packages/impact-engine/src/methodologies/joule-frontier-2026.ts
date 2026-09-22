import { Methodology } from '@imprint/schemas';

export const JOULE_FRONTIER_2026: Methodology = {
  id: 'joule-frontier-2026',
  name: 'Joule Frontier LLM Inference Study (2026)',
  version: '1.0.0',
  description:
    'Peer-reviewed empirical study published in Joule (April 2026) modeling energy consumption across frontier LLMs, distinguishing standard decoding from deep long-reasoning queries.',
  boundary: 'operational',
  primaryScope: 'operational',
  methodologyType: 'peer_reviewed_study',
  metricsSupported: ['energy_wh', 'water_consumption_ml', 'water_withdrawal_ml', 'carbon_g_co2e'],
  assumptions: [
    'Standard conversational query median energy consumption: 0.31 Wh.',
    'Extended reasoning queries (up to ~5,000 output tokens) scale up to ~3.91 Wh (~13x increase).',
    'Decoding (token generation) dominates energy consumption over prefill context ingestion.',
    'Prefill energy factor: ~0.00003 Wh per input token.',
    'Decoding energy factor: ~0.00028 Wh per output token.',
    'Reasoning energy factor: ~0.00072 Wh per reasoning token.',
    'Onsite water consumption estimated using industry standard WUE (average ~0.25 L/kWh).',
  ],
  sources: [
    {
      id: 'joule-2026-llm',
      title: 'Operational energy and carbon intensity of generative AI frontier inference',
      authors: 'Luccioni et al.',
      year: 2026,
      publisher: 'Joule (Cell Press)',
      doi: '10.1016/j.joule.2026.001145',
      url: 'https://www.sciencedirect.com/science/article/pii/S2542435126001145',
      notes: 'Demonstrates non-linear impact curve for chain-of-thought and test-time reasoning.',
    },
  ],
  uncertaintyModel: {
    energyVariancePct: 25,
    waterVariancePct: 40,
    carbonVariancePct: 35,
    notes: 'Variance accounts for unknown hardware generation (H100 vs B200) and datacenter WUE spread.',
  },
};
