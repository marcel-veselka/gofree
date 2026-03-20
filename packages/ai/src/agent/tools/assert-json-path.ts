import { tool } from 'ai';
import { z } from 'zod';

function resolveJsonPath(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

export const assertJsonPath = tool({
  description:
    'Parses a JSON string, resolves a dot-notation path, and asserts the value matches the expected value.',
  inputSchema: z.object({
    json: z.string().describe('The JSON string to parse'),
    path: z
      .string()
      .describe(
        'Dot-notation path to the value, e.g. "data.count" or "data.items.0.name"'
      ),
    expected: z
      .string()
      .describe('The expected value as a JSON-encoded string'),
  }),
  execute: async ({ json, path, expected }) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      return {
        passed: false,
        expected: JSON.parse(expected),
        actual: null,
        message: `Failed to parse JSON input`,
      };
    }

    let expectedValue: unknown;
    try {
      expectedValue = JSON.parse(expected);
    } catch {
      return {
        passed: false,
        expected,
        actual: null,
        message: `Failed to parse expected value as JSON`,
      };
    }

    const actual = resolveJsonPath(parsed, path);
    const passed = JSON.stringify(actual) === JSON.stringify(expectedValue);

    return {
      passed,
      expected: expectedValue,
      actual,
      message: passed
        ? `Value at "${path}" matches expected value`
        : `Value at "${path}" does not match: expected ${JSON.stringify(expectedValue)}, got ${JSON.stringify(actual)}`,
    };
  },
});
