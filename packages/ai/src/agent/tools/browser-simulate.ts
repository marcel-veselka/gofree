import { tool } from 'ai';
import { z } from 'zod';

export const browserNavigate = tool({
  description: 'Navigates the browser to the specified URL.',
  parameters: z.object({
    url: z.string().describe('The URL to navigate to'),
  }),
  execute: async ({ url }) => ({
    success: true,
    message: `Browser automation not yet connected — simulated success`,
    url,
  }),
});

export const browserClick = tool({
  description: 'Clicks on the element matching the specified selector.',
  parameters: z.object({
    selector: z.string().describe('The CSS selector of the element to click'),
  }),
  execute: async ({ selector }) => ({
    success: true,
    message: `Browser automation not yet connected — simulated success`,
    selector,
  }),
});

export const browserFill = tool({
  description:
    'Fills the input element matching the specified selector with the given value.',
  parameters: z.object({
    selector: z
      .string()
      .describe('The CSS selector of the input element to fill'),
    value: z.string().describe('The value to fill into the input'),
  }),
  execute: async ({ selector, value }) => ({
    success: true,
    message: `Browser automation not yet connected — simulated success`,
    selector,
    value,
  }),
});

export const browserScreenshot = tool({
  description: 'Takes a screenshot of the current browser page.',
  parameters: z.object({
    name: z
      .string()
      .optional()
      .describe('Optional name for the screenshot'),
  }),
  execute: async ({ name }) => ({
    success: true,
    message: `Browser automation not yet connected — simulated success`,
    name: name ?? 'screenshot',
  }),
});
