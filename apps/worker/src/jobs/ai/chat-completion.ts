import { task } from '@trigger.dev/sdk/v3';

export const chatCompletionTask = task({
  id: 'ai.chat-completion',
  run: async (payload: { conversationId: string; message: string }) => {
    // TODO: Run chat completion using @gofree/ai
    // 1. Load conversation history
    // 2. Stream response via AI SDK
    // 3. Save message to DB
    // 4. Update token usage
    return { conversationId: payload.conversationId, status: 'completed' };
  },
});
