import { ProviderId } from '@imprint/schemas';
import { AIProviderAdapter, DetectedModel } from './adapter';
import { estimateTokensFromStats } from './token-heuristics';

export class GeminiAdapter implements AIProviderAdapter {
  readonly id: ProviderId = 'gemini';
  readonly name = 'Gemini (Google)';

  isSupportedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'gemini.google.com' || parsed.hostname.endsWith('.gemini.google.com');
    } catch {
      return false;
    }
  }

  detectModel(doc?: Document): DetectedModel {
    if (!doc && typeof document !== 'undefined') {
      doc = document;
    }

    if (!doc) {
      return { raw: null, family: 'gemini-2-flash', isReasoningModel: false };
    }

    // Check Gemini model selector dropdown or badge in top left / header
    const modelSelectors = [
      'button[aria-label*="model"]',
      'div[class*="model-picker"]',
      'span[class*="model-title"]',
      '.mat-mdc-menu-trigger span',
    ];

    let foundRaw: string | null = null;

    for (const selector of modelSelectors) {
      const el = doc.querySelector(selector);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (
          text.includes('Gemini') ||
          text.includes('Flash') ||
          text.includes('Pro') ||
          text.includes('Ultra') ||
          text.includes('Advanced') ||
          text.includes('Thinking')
        ) {
          foundRaw = text;
          break;
        }
      }
    }

    // Check for thinking mode indicator in response
    const hasThinking = Boolean(
      doc.querySelector('div[class*="thinking-process"], button[aria-label*="thought"]')
    );

    return this.parseModelString(foundRaw, hasThinking);
  }

  parseModelString(raw: string | null, hasThinking: boolean = false): DetectedModel {
    if (!raw) {
      return {
        raw: null,
        family: 'gemini-2-flash',
        isReasoningModel: hasThinking,
      };
    }

    const lower = raw.toLowerCase();
    const isReasoning = hasThinking || lower.includes('think');

    let family = 'gemini-2-flash';
    if (lower.includes('pro') || lower.includes('advanced')) {
      family = 'gemini-2-pro';
    } else if (lower.includes('flash')) {
      family = 'gemini-2-flash';
    } else if (lower.includes('1.5')) {
      family = lower.includes('pro') ? 'gemini-1-5-pro' : 'gemini-1-5-flash';
    }

    return {
      raw,
      family,
      isReasoningModel: isReasoning,
    };
  }

  estimateTokens(charCount: number, wordCount: number, isInput: boolean): number {
    return estimateTokensFromStats(charCount, wordCount, { isInput });
  }

  static readonly SELECTORS = {
    turnContainer: 'user-query, model-response, div[class*="query-content"], div[class*="response-container"]',
    assistantMessage: 'model-response, div[class*="model-response-text"]',
    userMessage: 'user-query, div[class*="user-query-container"]',
    stopButton: 'button[aria-label*="Stop"], .stop-button',
    sendButton: 'button[aria-label*="Send"], .send-button',
  };
}
