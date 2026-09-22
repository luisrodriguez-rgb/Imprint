import { describe, it, expect } from 'vitest';
import {
  LedgerEventSchema,
  MethodologySchema,
  TextMetadataSchema,
  DataProvenanceSchema,
  ImpactScopeSchema,
} from '../src';

describe('@imprint/schemas', () => {
  it('validates a complete LedgerEvent with provenance and dual water accounting', () => {
    const sampleEvent = {
      id: 'evt-1001',
      timestamp: Date.now(),
      provider: 'chatgpt' as const,
      modelRaw: 'GPT-4o',
      modelFamily: 'gpt-4',
      sessionId: 'session-123',
      interactionIndex: 1,
      input: {
        charCount: 450,
        wordCount: 82,
        estimatedTokens: 110,
        modality: 'text' as const,
        provenance: 'local_estimation' as const,
      },
      output: {
        charCount: 1800,
        wordCount: 320,
        estimatedTokens: 420,
        reasoningTokens: 0,
        modality: 'text' as const,
        provenance: 'browser_observation' as const,
      },
      activity: {
        category: 'study' as const,
        source: 'manual' as const,
      },
      impact: {
        methodologyId: 'joule-frontier-2026',
        methodologyVersion: '1.0.0',
        energy: {
          operational: {
            min: 0.22,
            expected: 0.31,
            max: 0.45,
            unit: 'Wh',
            provenance: 'methodology_model' as const,
            scope: 'operational' as const,
          },
          datacenterPueOverhead: {
            min: 0.02,
            expected: 0.04,
            max: 0.07,
            unit: 'Wh',
            provenance: 'methodology_model' as const,
            scope: 'datacenter' as const,
          },
          total: {
            min: 0.24,
            expected: 0.35,
            max: 0.52,
            unit: 'Wh',
            provenance: 'methodology_model' as const,
            scope: 'datacenter' as const,
          },
        },
        water: {
          consumption: {
            onsite: {
              min: 0.08,
              expected: 0.12,
              max: 0.18,
              unit: 'mL',
              provenance: 'methodology_model' as const,
              scope: 'datacenter' as const,
            },
            upstream: {
              min: 0.12,
              expected: 0.21,
              max: 0.35,
              unit: 'mL',
              provenance: 'methodology_model' as const,
              scope: 'grid' as const,
            },
            total: {
              min: 0.20,
              expected: 0.33,
              max: 0.53,
              unit: 'mL',
              provenance: 'methodology_model' as const,
              scope: 'lifecycle' as const,
            },
          },
          withdrawal: {
            onsite: {
              min: 0.15,
              expected: 0.25,
              max: 0.40,
              unit: 'mL',
              provenance: 'methodology_model' as const,
              scope: 'datacenter' as const,
            },
            upstream: {
              min: 0.40,
              expected: 0.80,
              max: 1.40,
              unit: 'mL',
              provenance: 'methodology_model' as const,
              scope: 'grid' as const,
            },
            total: {
              min: 0.55,
              expected: 1.05,
              max: 1.80,
              unit: 'mL',
              provenance: 'methodology_model' as const,
              scope: 'lifecycle' as const,
            },
          },
        },
        carbon: {
          operational: {
            min: 0.08,
            expected: 0.14,
            max: 0.22,
            unit: 'g CO2e',
            provenance: 'methodology_model' as const,
            scope: 'grid' as const,
          },
          total: {
            min: 0.08,
            expected: 0.14,
            max: 0.22,
            unit: 'g CO2e',
            provenance: 'methodology_model' as const,
            scope: 'grid' as const,
          },
        },
      },
      confidence: {
        level: 'MEDIUM' as const,
        score: 65,
        summary: 'Output observed in browser; input tokens estimated heuristically.',
        checklist: [
          {
            id: 'model-detected',
            title: 'Model identity detected',
            status: 'verified' as const,
            passed: true,
            description: 'Detected GPT-4o in DOM',
          },
          {
            id: 'output-length',
            title: 'Output length observed',
            status: 'verified' as const,
            passed: true,
            description: '1,800 characters observed directly in DOM',
          },
          {
            id: 'input-tokens',
            title: 'Input tokens estimated',
            status: 'inferred' as const,
            passed: false,
            description: 'Input text not stored; estimated via char ratio',
          },
        ],
      },
    };

    const parsed = LedgerEventSchema.parse(sampleEvent);
    expect(parsed.id).toBe('evt-1001');
    expect(parsed.provider).toBe('chatgpt');
    expect(parsed.input.provenance).toBe('local_estimation');
    expect(parsed.output.provenance).toBe('browser_observation');
  });

  it('validates Methodology schema structure', () => {
    const methodology = {
      id: 'google-operational-2025',
      name: 'Google Gemini Operational Inference Benchmark',
      version: '1.0.0',
      description: 'Comprehensive operational inference measurement across Google production datacenters.',
      boundary: 'operational' as const,
      primaryScope: 'datacenter' as const,
      metricsSupported: ['energy_wh', 'water_consumption_ml', 'carbon_g_co2e'] as const,
      assumptions: [
        'Includes TPU hardware, CPU, host RAM, idle machinery, and cooling overhead',
        'Direct onsite water consumption measured via cooling system water meters',
      ],
      sources: [
        {
          id: 'google-blog-2025',
          title: 'Measuring the environmental impact of AI inference',
          year: 2025,
          publisher: 'Google Cloud Blog',
          url: 'https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference',
        },
      ],
      uncertaintyModel: {
        energyVariancePct: 20,
        waterVariancePct: 35,
        carbonVariancePct: 25,
      },
    };

    const parsed = MethodologySchema.parse(methodology);
    expect(parsed.id).toBe('google-operational-2025');
    expect(parsed.boundary).toBe('operational');
    expect(parsed.sources).toHaveLength(1);
  });
});
