import { describe, it, expect } from 'vitest';
import {
  ClaudeAdapter,
  GeminiAdapter,
  GrokAdapter,
  getAdapterForUrl,
  getAdapterById,
  ALL_ADAPTERS,
} from '../src';

describe('Multi-Provider Expansion', () => {
  it('registers all 4 core providers', () => {
    expect(ALL_ADAPTERS).toHaveLength(4);
    expect(getAdapterById('chatgpt').id).toBe('chatgpt');
    expect(getAdapterById('claude').id).toBe('claude');
    expect(getAdapterById('gemini').id).toBe('gemini');
    expect(getAdapterById('grok').id).toBe('grok');
  });

  describe('URL Resolution', () => {
    it('resolves correct adapter for each supported domain', () => {
      expect(getAdapterForUrl('https://claude.ai/chat/123')?.id).toBe('claude');
      expect(getAdapterForUrl('https://gemini.google.com/app/abc')?.id).toBe('gemini');
      expect(getAdapterForUrl('https://grok.com/chat/xyz')?.id).toBe('grok');
      expect(getAdapterForUrl('https://x.ai/grok')?.id).toBe('grok');
      expect(getAdapterForUrl('https://chatgpt.com/c/123')?.id).toBe('chatgpt');
      expect(getAdapterForUrl('https://wikipedia.org')).toBeNull();
    });
  });

  describe('ClaudeAdapter', () => {
    const claude = new ClaudeAdapter();

    it('identifies models and flags thinking mode', () => {
      const sonnet = claude.parseModelString('Claude 3.7 Sonnet', true);
      expect(sonnet.family).toBe('claude-3-7-sonnet');
      expect(sonnet.isReasoningModel).toBe(true);

      const haiku = claude.parseModelString('Claude 3.5 Haiku', false);
      expect(haiku.family).toBe('claude-3-5-haiku');
      expect(haiku.isReasoningModel).toBe(false);
    });
  });

  describe('GeminiAdapter', () => {
    const gemini = new GeminiAdapter();

    it('identifies Gemini models and thinking mode', () => {
      const flash = gemini.parseModelString('Gemini 2.0 Flash');
      expect(flash.family).toBe('gemini-2-flash');

      const proThinking = gemini.parseModelString('Gemini 2.0 Pro (Thinking)', true);
      expect(proThinking.family).toBe('gemini-2-pro');
      expect(proThinking.isReasoningModel).toBe(true);
    });
  });

  describe('GrokAdapter', () => {
    const grok = new GrokAdapter();

    it('identifies Grok models and reasoning mode', () => {
      const g3Think = grok.parseModelString('Grok 3 Think');
      expect(g3Think.family).toBe('grok-3');
      expect(g3Think.isReasoningModel).toBe(true);

      const g2 = grok.parseModelString('Grok 2');
      expect(g2.family).toBe('grok-2');
      expect(g2.isReasoningModel).toBe(false);
    });
  });
});
