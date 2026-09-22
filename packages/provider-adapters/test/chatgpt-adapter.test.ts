import { describe, it, expect } from 'vitest';
import { ChatGPTAdapter, estimateTokensFromStats, createTextMetadata } from '../src';

describe('@imprint/provider-adapters - ChatGPT', () => {
  const adapter = new ChatGPTAdapter();

  it('correctly identifies ChatGPT URLs', () => {
    expect(adapter.isSupportedUrl('https://chatgpt.com/c/1234-abcd')).toBe(true);
    expect(adapter.isSupportedUrl('https://chat.openai.com/g/g-some-gpt')).toBe(true);
    expect(adapter.isSupportedUrl('https://claude.ai/chat/abc')).toBe(false);
    expect(adapter.isSupportedUrl('https://google.com')).toBe(false);
  });

  it('parses model names and flags reasoning capabilities', () => {
    expect(adapter.parseModelString('ChatGPT 4o').family).toBe('gpt-4o');
    expect(adapter.parseModelString('ChatGPT 4o').isReasoningModel).toBe(false);

    expect(adapter.parseModelString('o1-mini (Preview)').family).toBe('o1-mini');
    expect(adapter.parseModelString('o1-mini (Preview)').isReasoningModel).toBe(true);

    expect(adapter.parseModelString('o3-mini Thinking').family).toBe('o3-mini');
    expect(adapter.parseModelString('o3-mini Thinking').isReasoningModel).toBe(true);

    expect(adapter.parseModelString(null).family).toBe('gpt-4o');
  });

  describe('Privacy-safe Token Estimator', () => {
    it('estimates tokens without reading text content', () => {
      // 1000 characters with 180 words
      const tokens = estimateTokensFromStats(1000, 180);
      expect(tokens).toBeGreaterThan(200);
      expect(tokens).toBeLessThan(300);
    });

    it('generates privacy-safe TextMetadata', () => {
      const meta = createTextMetadata(450, 75, true);
      expect(meta.charCount).toBe(450);
      expect(meta.wordCount).toBe(75);
      expect(meta.estimatedTokens).toBeGreaterThan(80);
      expect(meta.provenance).toBe('local_estimation');
      expect((meta as Record<string, unknown>).text).toBeUndefined(); // Guarantees zero text!
    });
  });
});
