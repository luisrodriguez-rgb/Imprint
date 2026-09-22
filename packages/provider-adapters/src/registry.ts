import { ProviderId } from '@imprint/schemas';
import { AIProviderAdapter } from './adapter';
import { ChatGPTAdapter } from './chatgpt';
import { ClaudeAdapter } from './claude';
import { GeminiAdapter } from './gemini';
import { GrokAdapter } from './grok';

export const ALL_ADAPTERS: AIProviderAdapter[] = [
  new ChatGPTAdapter(),
  new ClaudeAdapter(),
  new GeminiAdapter(),
  new GrokAdapter(),
];

export function getAdapterForUrl(url: string): AIProviderAdapter | null {
  for (const adapter of ALL_ADAPTERS) {
    if (adapter.isSupportedUrl(url)) {
      return adapter;
    }
  }
  return null;
}

export function getAdapterById(id: ProviderId): AIProviderAdapter {
  const match = ALL_ADAPTERS.find((a) => a.id === id);
  if (!match) {
    throw new Error(`No adapter found for provider ID: "${id}"`);
  }
  return match;
}
