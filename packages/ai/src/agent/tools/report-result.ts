import { tool } from 'ai';
import { z } from 'zod';

export const reportResult = tool({
  description:
    'Reports the final result of a test case with a status and summary.',
  inputSchema: z.object({
    status: z
      .enum(['passed', 'failed', 'skipped'])
      .describe('The test result status'),
    summary: z.string().describe('A summary of the test result'),
  }),
  execute: async ({ status, summary }) => ({
    status,
    summary,
    recorded: true,
  }),
});
