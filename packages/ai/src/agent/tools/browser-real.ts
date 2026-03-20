import { tool } from 'ai';
import { z } from 'zod';
import type { BrowserContext } from './browser-context';

/**
 * Create real Playwright-backed browser tools bound to a BrowserContext.
 * Each tool operates on the shared page within the context.
 */
export function createBrowserTools(ctx: BrowserContext) {
  const browserNavigate = tool({
    description: 'Navigates the browser to the specified URL. Waits for the page to load.',
    inputSchema: z.object({
      url: z.string().describe('The URL to navigate to (absolute or relative to baseUrl)'),
    }),
    execute: async ({ url }) => {
      const page = ctx.getPage();
      const start = Date.now();
      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
        const durationMs = Date.now() - start;
        return {
          success: true,
          url: page.url(),
          title: await page.title(),
          statusCode: response?.status() ?? 0,
          durationMs,
        };
      } catch (err) {
        return {
          success: false,
          url,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        };
      }
    },
  });

  const browserClick = tool({
    description: 'Clicks on the element matching the specified selector. Waits for the element to be visible first.',
    inputSchema: z.object({
      selector: z.string().describe('The CSS selector of the element to click'),
    }),
    execute: async ({ selector }) => {
      const page = ctx.getPage();
      try {
        await page.click(selector, { timeout: 10000 });
        return { success: true, selector };
      } catch (err) {
        return {
          success: false,
          selector,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  });

  const browserFill = tool({
    description: 'Fills the input element matching the specified selector with the given value. Clears existing text first.',
    inputSchema: z.object({
      selector: z.string().describe('The CSS selector of the input element to fill'),
      value: z.string().describe('The value to type into the input'),
    }),
    execute: async ({ selector, value }) => {
      const page = ctx.getPage();
      try {
        await page.fill(selector, value, { timeout: 10000 });
        return { success: true, selector, value };
      } catch (err) {
        return {
          success: false,
          selector,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  });

  const browserScreenshot = tool({
    description: 'Takes a screenshot of the current browser page viewport.',
    inputSchema: z.object({
      name: z.string().optional().describe('Optional name for the screenshot'),
    }),
    execute: async ({ name }) => {
      const page = ctx.getPage();
      const screenshotName = name ?? `screenshot-${Date.now()}`;
      try {
        const buffer = await page.screenshot({ type: 'png' });
        ctx.addScreenshot(screenshotName, buffer);
        return {
          success: true,
          name: screenshotName,
          sizeBytes: buffer.length,
          url: page.url(),
        };
      } catch (err) {
        return {
          success: false,
          name: screenshotName,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  });

  const browserGetText = tool({
    description: 'Gets the text content of the element matching the specified selector. Useful for assertion checks.',
    inputSchema: z.object({
      selector: z.string().describe('The CSS selector of the element to read text from'),
    }),
    execute: async ({ selector }) => {
      const page = ctx.getPage();
      try {
        const text = await page.textContent(selector, { timeout: 10000 });
        return { success: true, selector, text: text ?? '' };
      } catch (err) {
        return {
          success: false,
          selector,
          text: '',
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  });

  const browserIsVisible = tool({
    description: 'Checks whether the element matching the specified selector is visible on the page. Returns a structured assertion result.',
    inputSchema: z.object({
      selector: z.string().describe('The CSS selector to check visibility of'),
    }),
    execute: async ({ selector }) => {
      const page = ctx.getPage();
      try {
        const visible = await page.isVisible(selector, { timeout: 5000 });
        return {
          passed: visible,
          expected: true,
          actual: visible,
          message: visible
            ? `Element "${selector}" is visible`
            : `Element "${selector}" is not visible`,
        };
      } catch (err) {
        return {
          passed: false,
          expected: true,
          actual: false,
          message: `Error checking visibility: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    },
  });

  const browserWaitForSelector = tool({
    description: 'Waits for the element matching the selector to appear on the page.',
    inputSchema: z.object({
      selector: z.string().describe('The CSS selector to wait for'),
      timeout: z.number().optional().describe('Timeout in ms (default 10000)'),
    }),
    execute: async ({ selector, timeout }) => {
      const page = ctx.getPage();
      try {
        await page.waitForSelector(selector, { timeout: timeout ?? 10000 });
        return { success: true, selector };
      } catch (err) {
        return {
          success: false,
          selector,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    },
  });

  return {
    browserNavigate,
    browserClick,
    browserFill,
    browserScreenshot,
    browserGetText,
    browserIsVisible,
    browserWaitForSelector,
  };
}
