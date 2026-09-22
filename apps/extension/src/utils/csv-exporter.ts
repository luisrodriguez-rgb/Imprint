import { LedgerEvent } from '@imprint/schemas';

/**
 * Converts ledger events into a standardized CSV string.
 */
export function exportEventsToCsv(events: LedgerEvent[]): string {
  if (events.length === 0) return '';

  const headers = [
    'Event ID',
    'Timestamp (ISO)',
    'Provider',
    'Model Raw',
    'Model Family',
    'Session ID',
    'Interaction Index',
    'Activity',
    'Input Chars',
    'Input Estimated Tokens',
    'Input Provenance',
    'Output Chars',
    'Output Estimated Tokens',
    'Output Provenance',
    'Reasoning Tokens',
    'Methodology ID',
    'Energy Total (Wh)',
    'Energy Min (Wh)',
    'Energy Max (Wh)',
    'Water Consumed Total (mL)',
    'Water Consumed Onsite (mL)',
    'Water Consumed Upstream (mL)',
    'Carbon Total (g CO2e)',
    'Confidence Level',
    'Confidence Score',
  ];

  const rows = events.map((e) => {
    return [
      e.id,
      new Date(e.timestamp).toISOString(),
      e.provider,
      `"${(e.modelRaw || '').replace(/"/g, '""')}"`,
      e.modelFamily || '',
      e.sessionId,
      e.interactionIndex,
      e.activity.category,
      e.input.charCount,
      e.input.estimatedTokens,
      e.input.provenance,
      e.output.charCount,
      e.output.estimatedTokens,
      e.output.provenance,
      e.output.reasoningTokens || 0,
      e.impact.methodologyId,
      e.impact.energy.total.expected,
      e.impact.energy.total.min,
      e.impact.energy.total.max,
      e.impact.water.consumption.total.expected,
      e.impact.water.consumption.onsite.expected,
      e.impact.water.consumption.upstream.expected,
      e.impact.carbon.total.expected,
      e.confidence.level,
      e.confidence.score,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
