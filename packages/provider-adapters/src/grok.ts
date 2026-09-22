import { ProviderId } from '@imprint/schemas';
import { AIProviderAdapter, DetectedModel } from './adapter';
import { estimateTokensFromStats } from './token-heuristics';

export class GrokAdapter implements AIProviderAdapter {
  readonly id: ProviderId = 'grok';
  readonly name = 'Grok (xAI)';

  isSupportedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === 'grok.com' ||
        parsed.hostname === 'x.ai' ||
        parsed.hostname.endsWith('.x.ai') ||
        parsed.hostname.endsWith('.grok.com')
      );
    } catch {
      return false;
    }
  }

  detectModel(doc?: Document): DetectedModel {
    if (!doc && typeof document !== 'undefined') {
      doc = document;
    }

    if (!doc) {
      return { raw: null, family: 'grok-3', isReasoningModel: false };
    }

    // Check model selector button or tabs (Grok 2, Grok 3, DeepSearch, Think)
    const modelSelectors = [
      'button[data-testid*="model"]',
      'div[class*="model-select"]',
      'span[class*="model-name"]',
      'button[aria-haspopup="menu"]',
    ];

    let foundRaw: string | null = null;

    for (const selector of modelSelectors) {
      const el = doc.querySelector(selector);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (text.includes('Grok') || text.includes('Think') || text.includes('DeepSearch')) {
          foundRaw = text;
          break;
        }
      }
    }

    const hasThinking = Boolean(
      doc.querySelector('div[class*="thought"], div[class*="reasoning"]')
    );

    return this.parseModelString(foundRaw, hasThinking);
  }

  parseModelString(raw: string | null, hasThinking: boolean = false): DetectedModel {
    if (!raw) {
      return {
        raw: null,
        family: 'grok-3',
        isReasoningModel: hasThinking,
      };
    }

    const lower = raw.toLowerCase();
    const isReasoning = hasThinking || lower.includes('think') || lower.includes('deepsearch');

    let family = 'grok-3';
    if (lower.includes('grok 3') || lower.includes('grok-3')) {
      family = 'grok-3';
    } else if (lower.includes('grok 2') || lower.includes('grok-2')) {
      family = 'grok-2';
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
    turnContainer: 'div[data-testid*="message-row"], div[class*="message-container"]',
    assistantMessage: 'div[data-testid*="assistant-message"], div[class*="response"]',
    userMessage: 'div[data-testid*="user-message"], div[class*="user"]',
    stopButton: 'button[aria-label*="Stop"]',
    sendButton: 'button[aria-label*="Send"], button[data-testid="send-button"]',
  };
}
