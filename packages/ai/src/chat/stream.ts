import { streamText } from 'ai';
import { getProvider } from '../providers/registry.js';
import type { ProviderName } from '../providers/registry.js';

interface StreamChatOptions {
  provider: ProviderName;
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  tools?: Record<string, unknown>;
}

export async function streamChat(options: StreamChatOptions) {
  const provider = getProvider(options.provider);

  const result = streamText({
    model: provider(options.model),
    messages: options.messages,
  });

  return result;
}
