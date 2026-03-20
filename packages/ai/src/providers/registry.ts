import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export type ProviderName = 'openai' | 'anthropic';

export function getProvider(name: ProviderName) {
  switch (name) {
    case 'openai':
      return createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    case 'anthropic':
      return createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
        ...(process.env.ANTHROPIC_BASE_URL ? { baseURL: process.env.ANTHROPIC_BASE_URL } : {}),
      });
    default:
      throw new Error(`Unknown AI provider: ${name}`);
  }
}
