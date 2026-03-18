import { task } from '@trigger.dev/sdk/v3';

export const agentRunTask = task({
  id: 'ai.agent-run',
  maxDuration: 300, // 5 minutes
  run: async (payload: { runId: string; projectId: string }) => {
    // TODO: Execute agent run
    // 1. Load run config and tools
    // 2. Run agent loop (LLM → tool call → result → LLM)
    // 3. Update run status and artifacts
    // 4. Log steps and token usage
    return { runId: payload.runId, status: 'completed' };
  },
});
