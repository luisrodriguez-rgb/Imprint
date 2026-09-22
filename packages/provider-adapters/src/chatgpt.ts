import { ProviderId } from '@imprint/schemas';
import { AIProviderAdapter, DetectedModel } from './adapter';
import { estimateTokensFromStats } from './token-heuristics';

export class ChatGPTAdapter implements AIProviderAdapter {
  readonly id: ProviderId = 'chatgpt';
  readonly name = 'ChatGPT (OpenAI)';

  isSupportedUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return (
        parsed.hostname === 'chatgpt.com' ||
        parsed.hostname === 'chat.openai.com' ||
        parsed.hostname.endsWith('.chatgpt.com')
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
      return { raw: null, family: null, isReasoningModel: false };
    }

    // Try detecting from model selector button or dropdown in ChatGPT top bar
    const modelSelectors = [
      'button[data-testid="model-switcher-button"]',
      'button[aria-haspopup="menu"] span',
      'div[class*="text-token-text-secondary"]',
    ];

    let foundRaw: string | null = null;

    for (const selector of modelSelectors) {
      const el = doc.querySelector(selector);
      if (el && el.textContent) {
        const text = el.textContent.trim();
        if (
          text.includes('GPT-4') ||
          text.includes('GPT-3') ||
          text.includes('o1') ||
          text.includes('o3') ||
          text.includes('4o') ||
          text.includes('Canvas') ||
          text.includes('Study')
        ) {
          foundRaw = text;
          break;
        }
      }
    }

    // Fallback: check document title or meta tags
    if (!foundRaw) {
      const title = doc.title;
      if (title.includes('ChatGPT')) {
        foundRaw = 'ChatGPT';
      }
    }

    return this.parseModelString(foundRaw);
  }

  parseModelString(raw: string | null): DetectedModel {
    if (!raw) {
      return { raw: null, family: 'gpt-4o', isReasoningModel: false };
    }

    const lower = raw.toLowerCase();
    const isReasoning =
      lower.includes('o1') ||
      lower.includes('o3') ||
      lower.includes('reasoning') ||
      lower.includes('thinking');

    let family = 'gpt-4o';
    if (lower.includes('o1-mini')) {
      family = 'o1-mini';
    } else if (lower.includes('o3-mini')) {
      family = 'o3-mini';
    } else if (lower.includes('4o-mini') || lower.includes('mini')) {
      family = 'gpt-4o-mini';
    } else if (lower.includes('o1')) {
      family = 'o1';
    } else if (lower.includes('o3')) {
      family = 'o3';
    } else if (lower.includes('gpt-4')) {
      family = 'gpt-4';
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

  /**
   * DOM CSS selectors for ChatGPT turns and streaming status
   */
  static readonly SELECTORS = {
    // Top-level container for conversation turns
    turn: 'article[data-testid^="conversation-turn"]',
    // Assistant message bubble
    assistantMessage: 'div[data-message-author-role="assistant"]',
    // User message bubble
    userMessage: 'div[data-message-author-role="user"]',
    // Stop generating button indicating streaming in progress
    stopButton: 'button[data-testid="stop-button"], button[aria-label="Stop streaming"]',
    // Send button indicating readiness
    sendButton: 'button[data-testid="send-button"]',
  };
}
