import { Methodology } from '@imprint/schemas';

export const GOOGLE_OPERATIONAL_2025: Methodology = {
  id: 'google-operational-2025',
  name: 'Google Gemini Operational Production Benchmark (2025)',
  version: '1.0.0',
  description:
    'Empirical measurement of Gemini Apps text inference in Google data centers, capturing TPU silicon, CPU/RAM host power, idle server allocation, PUE, and direct onsite cooling tower water evaporation.',
  boundary: 'operational',
  primaryScope: 'datacenter',
  metricsSupported: ['energy_wh', 'water_consumption_ml', 'carbon_g_co2e'],
  assumptions: [
    'Median text interaction uses 0.24 Wh electrical energy (operational + PUE overhead).',
    'Direct onsite water consumption is ~0.26 mL per median interaction via evaporative cooling.',
    'Datacenter PUE average is approximately 1.10 (Google operational fleet efficiency).',
    'Excludes upstream grid water withdrawal and supply-chain hardware manufacturing embodiment.',
    'Calibrated on TPU v5e/v5p serving systems running Gemini Flash and Pro models in May 2025.',
  ],
  sources: [
    {
      id: 'google-inference-2025',
      title: 'Measuring the environmental impact of AI inference',
      authors: 'Google Cloud Infrastructure & Sustainability Teams',
      year: 2025,
      publisher: 'Google Cloud Official Blog',
      url: 'https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference',
      notes: 'Reported 33x drop in energy per median prompt over 12 months.',
    },
  ],
  uncertaintyModel: {
    energyVariancePct: 20, // ±20% due to prompt length variations and datacenter thermal fluctuations
    waterVariancePct: 35,  // ±35% due to ambient wet-bulb temperature variations and cooling modes
    carbonVariancePct: 30, // ±30% due to regional grid mix hourly variance
    notes: 'Variance applies to standard conversational prompts without extensive reasoning chains.',
  },
};
