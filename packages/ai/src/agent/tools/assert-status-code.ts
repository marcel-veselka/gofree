import { tool } from 'ai';
import { z } from 'zod';

export const assertStatusCode = tool({
  description:
    'Asserts that the actual HTTP status code matches the expected status code.',
  parameters: z.object({
    actual: z.number().describe('The actual HTTP status code received'),
    expected: z.number().describe('The expected HTTP status code'),
  }),
  execute: async ({ actual, expected }) => {
    const passed = actual === expected;
    return {
      passed,
      expected,
      actual,
      message: passed
        ? `Status code ${actual} matches expected ${expected}`
        : `Status code mismatch: expected ${expected}, got ${actual}`,
    };
  },
});
