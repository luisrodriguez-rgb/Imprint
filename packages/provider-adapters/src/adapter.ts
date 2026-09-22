import { ProviderId, TextMetadata } from '@imprint/schemas';

export interface DetectedModel {
  raw: string | null;
  family: string | null;
  isReasoningModel: boolean;
}

export interface ObservedInteraction {
  provider: ProviderId;
  model: DetectedModel;
  interactionIndex: number;
  input: TextMetadata;
  output: TextMetadata & { reasoningTokens?: number };
  durationMs?: number;
}

export interface AIProviderAdapter {
  id: ProviderId;
  name: string;
  isSupportedUrl(url: string): boolean;
  detectModel(documentOrWindow?: unknown): DetectedModel;
  estimateTokens(charCount: number, wordCount: number, isInput: boolean): number;
}
