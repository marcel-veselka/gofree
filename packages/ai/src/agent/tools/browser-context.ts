import { chromium, type Browser, type Page, type BrowserContext as PwContext } from 'playwright';

/**
 * Manages a Playwright browser instance and page for use across
 * multiple tool calls within a single test case execution.
 */
export class BrowserContext {
  private browser: Browser | null = null;
  private context: PwContext | null = null;
  private page: Page | null = null;
  private screenshots: Array<{ name: string; buffer: Buffer; capturedAt: Date }> = [];

  constructor(
    private options: {
      headless?: boolean;
      viewport?: { width: number; height: number };
      baseUrl?: string;
    } = {}
  ) {}

  async launch(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.options.headless ?? true,
    });
    this.context = await this.browser.newContext({
      viewport: this.options.viewport ?? { width: 1440, height: 900 },
      baseURL: this.options.baseUrl,
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(15000);
  }

  getPage(): Page {
    if (!this.page) throw new Error('Browser not launched — call launch() first');
    return this.page;
  }

  getScreenshots() {
    return this.screenshots;
  }

  addScreenshot(name: string, buffer: Buffer) {
    this.screenshots.push({ name, buffer, capturedAt: new Date() });
  }

  async close(): Promise<void> {
    try {
      await this.context?.close();
      await this.browser?.close();
    } catch {
      // Ignore close errors
    }
    this.page = null;
    this.context = null;
    this.browser = null;
  }
}
