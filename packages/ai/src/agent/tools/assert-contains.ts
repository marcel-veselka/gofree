import { tool } from 'ai';
import { z } from 'zod';

export const assertContains = tool({
  description:
    'Asserts that the given text contains the specified substring.',
  parameters: z.object({
    text: z.string().describe('The text to search within'),
    substring: z.string().describe('The substring to search for'),
  }),
  execute: async ({ text, substring }) => {
    const passed = text.includes(substring);
    return {
      passed,
      expected: substring,
      actual: text,
      message: passed
        ? `Text contains "${substring}"`
        : `Text does not contain "${substring}"`,
    };
  },
});
