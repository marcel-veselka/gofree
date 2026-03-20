import { tool } from 'ai';
import { z } from 'zod';

const WRITE_OPERATIONS = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE)\b/i;

export const dbQuery = tool({
  description:
    'Executes a read-only SQL query against the specified database. Write operations are blocked.',
  inputSchema: z.object({
    query: z.string().describe('The SQL query to execute'),
    connectionString: z
      .string()
      .describe('The database connection string'),
  }),
  execute: async ({ query }) => {
    if (WRITE_OPERATIONS.test(query)) {
      return {
        rows: [],
        rowCount: 0,
        durationMs: 0,
        message: `Write operation blocked: queries starting with INSERT, UPDATE, DELETE, DROP, ALTER, or TRUNCATE are not allowed`,
      };
    }

    return {
      rows: [],
      rowCount: 0,
      durationMs: 0,
      message:
        'DB query execution not yet connected - simulated empty result',
    };
  },
});
