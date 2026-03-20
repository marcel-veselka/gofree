import { tool } from 'ai';
import { z } from 'zod';

export const apiCall = tool({
  description:
    'Makes an HTTP request to the specified URL and returns the response status, headers, body, and duration.',
  parameters: z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
    url: z.string().describe('The URL to send the request to'),
    headers: z
      .record(z.string())
      .optional()
      .describe('Optional HTTP headers as key-value pairs'),
    body: z
      .string()
      .optional()
      .describe('Optional request body as a string'),
    timeout: z
      .number()
      .optional()
      .default(30000)
      .describe('Request timeout in milliseconds (default 30000)'),
  }),
  execute: async ({ method, url, headers, body, timeout }) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const start = Date.now();

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
      });

      const durationMs = Date.now() - start;
      const responseBody = await response.text();
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        statusCode: response.status,
        headers: responseHeaders,
        body: responseBody,
        durationMs,
      };
    } catch (error) {
      const durationMs = Date.now() - start;
      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          statusCode: 0,
          headers: {},
          body: `Request timed out after ${timeout}ms`,
          durationMs,
        };
      }
      return {
        statusCode: 0,
        headers: {},
        body: `Request failed: ${error instanceof Error ? error.message : String(error)}`,
        durationMs,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  },
});
