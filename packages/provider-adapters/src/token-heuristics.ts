import { TextMetadata } from '@imprint/schemas';

export interface TokenEstimationOptions {
  isInput?: boolean;
  hasCode?: boolean;
  language?: string;
}

/**
 * Privacy-preserving token estimator.
 * Estimates tokens from character and word counts without storing or sending the prompt text.
 */
export function estimateTokensFromStats(
  charCount: number,
  wordCount: number,
  options: TokenEstimationOptions = {}
): number {
  if (charCount <= 0) return 0;

  // Code or technical formatting uses fewer characters per token (ratio ~3.0 - 3.2 chars/token)
  if (options.hasCode) {
    return Math.max(1, Math.round(charCount / 3.2));
  }

  // If word count is available, average tokens is roughly 1.3 tokens per word
  if (wordCount > 0) {
    const tokensFromWords = Math.round(wordCount * 1.33);
    const tokensFromChars = Math.round(charCount / 3.8);
    // Weighted blend: 60% word-based, 40% char-based
    return Math.max(1, Math.round(tokensFromWords * 0.6 + tokensFromChars * 0.4));
  }

  // Fallback purely on character count (standard English/Latin text averages ~3.8 - 4.0 chars/token)
  return Math.max(1, Math.round(charCount / 3.8));
}

/**
 * Creates privacy-safe TextMetadata from character and word counts.
 */
export function createTextMetadata(
  charCount: number,
  wordCount: number,
  isInput: boolean,
  options: TokenEstimationOptions = {}
): TextMetadata {
  return {
    charCount,
    wordCount,
    estimatedTokens: estimateTokensFromStats(charCount, wordCount, { ...options, isInput }),
    modality: 'text',
    provenance: isInput ? 'local_estimation' : 'browser_observation',
  };
}
