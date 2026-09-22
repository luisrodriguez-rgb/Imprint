import { describe, it, expect } from 'vitest';
import { exportEventsToCsv } from '../src/utils/csv-exporter';
import { LedgerEvent } from '@imprint/schemas';

describe('CSV Exporter', () => {
  it('returns empty string for empty event list', () => {
    expect(exportEventsToCsv([])).toBe('');
  });

  it('exports structured LedgerEvents with all required environmental and provenance columns', () => {
    const sampleEvent: LedgerEvent = {
      id: 'evt-test-1',
      timestamp: 1774268000000,
      provider: 'chatgpt',
      modelRaw: 'GPT-4o "Omni"',
      modelFamily: 'gpt-4o',
      sessionId: 'sess-123',
      interactionIndex: 1,
      input: {
        charCount: 200,
        wordCount: 35,
        estimatedTokens: 52,
        modality: 'text',
        provenance: 'local_estimation',
      },
      output: {
        charCount: 900,
        wordCount: 150,
        estimatedTokens: 236,
        reasoningTokens: 0,
        modality: 'text',
        provenance: 'browser_observation',
      },
      activity: {
        category: 'study',
        source: 'manual',
      },
      impact: {
        methodologyId: 'joule-frontier-2026',
        methodologyVersion: '1.0.0',
        energy: {
          operational: { min: 0.2, expected: 0.31, max: 0.4, unit: 'Wh', provenance: 'methodology_model', scope: 'operational' },
          datacenterPueOverhead: { min: 0.02, expected: 0.04, max: 0.06, unit: 'Wh', provenance: 'methodology_model', scope: 'datacenter' },
          total: { min: 0.22, expected: 0.35, max: 0.46, unit: 'Wh', provenance: 'methodology_model', scope: 'datacenter' },
        },
        water: {
          consumption: {
            onsite: { min: 0.08, expected: 0.11, max: 0.15, unit: 'mL', provenance: 'methodology_model', scope: 'datacenter' },
            upstream: { min: 0.4, expected: 0.63, max: 0.9, unit: 'mL', provenance: 'methodology_model', scope: 'grid' },
            total: { min: 0.48, expected: 0.74, max: 1.05, unit: 'mL', provenance: 'methodology_model', scope: 'grid' },
          },
          withdrawal: {
            onsite: { min: 0.1, expected: 0.18, max: 0.25, unit: 'mL', provenance: 'methodology_model', scope: 'datacenter' },
            upstream: { min: 3.0, expected: 5.25, max: 7.5, unit: 'mL', provenance: 'methodology_model', scope: 'grid' },
            total: { min: 3.1, expected: 5.43, max: 7.75, unit: 'mL', provenance: 'methodology_model', scope: 'grid' },
          },
        },
        carbon: {
          operational: { min: 0.08, expected: 0.13, max: 0.18, unit: 'g CO2e', provenance: 'methodology_model', scope: 'grid' },
          total: { min: 0.08, expected: 0.13, max: 0.18, unit: 'g CO2e', provenance: 'methodology_model', scope: 'grid' },
        },
      },
      confidence: {
        level: 'HIGH',
        score: 75,
        summary: 'Observed in browser',
        checklist: [],
      },
    };

    const csv = exportEventsToCsv([sampleEvent]);
    expect(csv).toContain('Event ID,Timestamp (ISO),Provider');
    expect(csv).toContain('evt-test-1');
    expect(csv).toContain('chatgpt');
    expect(csv).toContain('""Omni""'); // Escaped quotes
    expect(csv).toContain('0.35'); // Energy
    expect(csv).toContain('0.74'); // Water consumed
  });
});
