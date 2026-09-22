import { Methodology } from '@imprint/schemas';

export const OPENAI_REFERENCE_2025: Methodology = {
  id: 'openai-reference-2025',
  name: 'OpenAI Public Reference Benchmark (2025)',
  version: '1.0.0',
  description:
    'Public baseline figures disclosed by OpenAI leadership (June 2025) for an "average ChatGPT query" (0.34 Wh electricity and ~0.32 mL / 0.000085 gallons water).',
  boundary: 'operational',
  primaryScope: 'datacenter',
  metricsSupported: ['energy_wh', 'water_consumption_ml', 'carbon_g_co2e'],
  assumptions: [
    '0.34 Wh electricity per average query.',
    '0.000085 gallons of water (~0.32 mL) per average query.',
    'Assumes average mixture of GPT-4o and mini models deployed across Microsoft Azure infrastructure.',
    'Includes direct onsite evaporative cooling (WUE ~0.27 L/kWh as reported by Microsoft Azure 2025 sustainability reports).',
  ],
  sources: [
    {
      id: 'altman-gentle-singularity-2025',
      title: 'The Gentle Singularity',
      authors: 'Sam Altman',
      year: 2025,
      publisher: 'Personal Blog / OpenAI',
      url: 'https://blog.samaltman.com/the-gentle-singularity',
      notes:
        'Informal public estimate; detailed dataset, token lengths, and architectural whitepaper were not publicly released.',
    },
    {
      id: 'microsoft-wue-2025',
      title: 'Inside Microsoft’s two-decade push to cut water intensity while scaling for growth',
      year: 2025,
      publisher: 'Microsoft Corporate Sustainability',
      url: 'https://blogs.microsoft.com/blog/2026/06/24/inside-microsofts-two-decade-push-to-cut-water-intensity-while-scaling-for-growth/',
      notes: 'Reported average fleet WUE of 0.27 L/kWh.',
    },
  ],
  uncertaintyModel: {
    energyVariancePct: 40,
    waterVariancePct: 50,
    carbonVariancePct: 45,
    notes: 'Higher uncertainty due to lack of published token distribution and hardware utilization breakdowns.',
  },
};
