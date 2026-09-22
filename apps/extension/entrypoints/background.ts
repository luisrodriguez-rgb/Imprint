import { defineBackground } from 'wxt/utils/define-background';
import { LedgerEvent } from '@imprint/schemas';
import { estimateImpact } from '@imprint/impact-engine';
import {
  appendLedgerEvent,
  getLedgerEvents,
  getSettings,
  aggregateSessionSummary,
} from '../src/storage/ledger-storage';

export default defineBackground(() => {
  // Listen for messages from content scripts or popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'RECORD_INTERACTION') {
        handleRecordInteraction(message.payload).then((event) => {
          sendResponse({ success: true, event });
        });
        return true; // Keep channel open for async response
      }

      if (message.type === 'GET_LEDGER_DATA') {
        Promise.all([getLedgerEvents(), getSettings()]).then(([events, settings]) => {
          const summary = aggregateSessionSummary(events);
          sendResponse({ events, summary, settings });
        });
        return true;
      }
    });
  }
});

async function handleRecordInteraction(payload: {
  sessionId: string;
  provider: import('@imprint/schemas').ProviderId;
  modelRaw: string | null;
  modelFamily: string | null;
  interactionIndex: number;
  inputCharCount: number;
  inputWordCount: number;
  outputCharCount: number;
  outputWordCount: number;
  reasoningTokens?: number;
  durationMs?: number;
}): Promise<LedgerEvent> {
  const settings = await getSettings();

  // Estimate input and output tokens client-side (no prompt text ever stored)
  const inputEstimatedTokens = Math.max(1, Math.round(payload.inputCharCount / 3.8));
  const outputEstimatedTokens = Math.max(1, Math.round(payload.outputCharCount / 3.8));

  // Calculate environmental impacts using versioned methodology
  const calculation = estimateImpact({
    inputTokens: inputEstimatedTokens,
    outputTokens: outputEstimatedTokens,
    reasoningTokens: payload.reasoningTokens || 0,
    modelFamily: payload.modelFamily,
    providerId: payload.provider,
    methodologyId: settings.activeMethodologyId,
    gridCarbonIntensityGPerKwh: settings.gridCarbonIntensity,
    inputProvenance: 'local_estimation',
    outputProvenance: 'browser_observation',
    modelDetected: payload.modelRaw !== null,
  });

  const event: LedgerEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    provider: payload.provider,
    modelRaw: payload.modelRaw,
    modelFamily: payload.modelFamily,
    sessionId: payload.sessionId,
    interactionIndex: payload.interactionIndex,
    durationMs: payload.durationMs,
    input: {
      charCount: payload.inputCharCount,
      wordCount: payload.inputWordCount,
      estimatedTokens: inputEstimatedTokens,
      modality: 'text',
      provenance: 'local_estimation',
    },
    output: {
      charCount: payload.outputCharCount,
      wordCount: payload.outputWordCount,
      estimatedTokens: outputEstimatedTokens,
      reasoningTokens: payload.reasoningTokens,
      modality: 'text',
      provenance: 'browser_observation',
    },
    activity: {
      category: settings.currentActivity || 'study',
      source: 'manual',
    },
    impact: calculation.impact,
    confidence: calculation.confidence,
  };

  await appendLedgerEvent(event);

  // Update extension action badge
  if (typeof chrome !== 'undefined' && chrome.action) {
    chrome.action.setBadgeText({ text: `${calculation.impact.energy.total.expected}Wh` });
    chrome.action.setBadgeBackgroundColor({ color: '#f59e0b' });
  }

  return event;
}
