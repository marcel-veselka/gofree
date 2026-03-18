import { task } from '@trigger.dev/sdk/v3';

export const mcpToolExecutionTask = task({
  id: 'mcp.tool-execution',
  maxDuration: 60, // 1 minute
  run: async (payload: { connectionId: string; toolName: string; args: Record<string, unknown> }) => {
    // TODO: Execute MCP tool via @gofree/mcp client
    return { toolName: payload.toolName, result: {} };
  },
});
