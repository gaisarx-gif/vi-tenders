/**
 * AI provider factory.
 *
 * Returns the configured AIProvider based on the AI_PROVIDER env var.
 * Defaults to "gemini". Add new providers here as they are implemented.
 */

import { AIProvider } from './provider.js';
import { GeminiProvider } from './providers/gemini.js';

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const providerName = (process.env.AI_PROVIDER ?? 'gemini').toLowerCase();

  switch (providerName) {
    case 'gemini':
      cachedProvider = new GeminiProvider();
      break;
    default:
      throw new Error(`Unknown AI_PROVIDER "${providerName}". Supported: gemini`);
  }

  return cachedProvider;
}

export type { AIProvider, RawExtraction, TenderSummaryInput } from './provider.js';
