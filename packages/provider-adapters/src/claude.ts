import { ProviderId } from '@imprint/schemas';
import { AIProviderAdapter, DetectedModel } from './adapter';
import { estimateTokensFromStats } from './token-heuristics';

export class ClaudeAdapter implements AIProviderAdapter {
  readonly id: ProviderId = 'claude';
  readonly name = 'Claude (Anthropic)';

  isSupportedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.hostname === 'claude.ai' || parsed.hostname.endsWith('.claude.ai');
    } catch {
      return false;
    }
  }

  detectModel(doc?: Document): DetectedModel {
    if (!doc && typeof document !== 'undefined') {
      doc = document;
    }

    if (!doc) {
      return { raw: null, family: 'claude-3-7-sonnet', isReasoningModel: false };
    }

    // Check model selector button in header or chat controls
    const modelSelectors = [
      'button[data-testid="model-selector-dropdown"]',
      'button[aria-label*="model"]',
      'div[class*="ModelSelector"]',
      'span[class*="text-text-300"]',
    ];

    let foundRaw: string | null = null;

    for (const selector of modelSelectors) {
      const el = doc.querySelector(selector);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (
          text.includes('Claude') ||
          text.includes('Sonnet') ||
          text.includes('Haiku') ||
          text.includes('Opus') ||
          text.includes('3.5') ||
          text.includes('3.7')
        ) {
          foundRaw = text;
          break;
        }
      }
    }

    // Check if "Thinking" or extended reasoning is visible in the active DOM
    const hasThinking = Boolean(
      doc.querySelector('div[class*="thinking"], button[data-testid*="thinking"]')
    );

    return this.parseModelString(foundRaw, hasThinking);
  }

  parseModelString(raw: string | null, hasThinking: boolean = false): DetectedModel {
    if (!raw) {
      return {
        raw: null,
        family: 'claude-3-7-sonnet',
        isReasoningModel: hasThinking,
      };
    }

    const lower = raw.toLowerCase();
    const isReasoning = hasThinking || lower.includes('think') || lower.includes('reason');

    let family = 'claude-3-7-sonnet';
    if (lower.includes('3.5 sonnet') || lower.includes('3-5-sonnet')) {
      family = 'claude-3-5-sonnet';
    } else if (lower.includes('3.7') || lower.includes('3-7')) {
      family = 'claude-3-7-sonnet';
    } else if (lower.includes('haiku')) {
      family = 'claude-3-5-haiku';
    } else if (lower.includes('opus')) {
      family = 'claude-3-opus';
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
    turnContainer: 'div[class*="ConversationItem"], div[class*="message-container"]',
    assistantMessage: 'div[class*="font-claude-message"], div[data-is-streaming]',
    userMessage: 'div[data-testid="user-message"], div[class*="font-user-message"]',
    stopButton: 'button[aria-label="Stop Response"], button[data-testid="stop-button"]',
    sendButton: 'button[aria-label="Send Message"]',
  };
}
