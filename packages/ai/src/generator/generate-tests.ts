import { generateText, Output } from 'ai';
import { z } from 'zod';
import { chromium } from 'playwright';
import { db } from '@gofree/db';
import { slugify } from '@gofree/core';
import { getProvider } from '../providers/registry';

// ── Types ────────────────────────────────────────────────────

export interface GenerateTestsOptions {
  url: string;
  projectId: string;
  orgSlug: string;
  targetType?: 'WEB' | 'API';
  onProgress?: (event: { type: string; message: string }) => void;
}

export interface GeneratedSuite {
  name: string;
  description: string;
  testCases: Array<{
    title: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    steps: Array<{ type: string; params: Record<string, unknown> }>;
    expectedAssertions: Array<{
      type: string;
      target?: string;
      expected: unknown;
      description?: string;
    }>;
    tags: string[];
  }>;
}

// ── Zod schema for structured output ─────────────────────────

const assertionSchema = z.object({
  type: z.enum([
    'equals', 'contains', 'matches', 'visible', 'not-visible',
    'status-code', 'json-path', 'row-count', 'custom',
  ]),
  target: z.string().optional(),
  expected: z.unknown(),
  description: z.string().optional(),
});

const stepSchema = z.object({
  type: z.enum([
    'navigate', 'click', 'fill', 'select', 'hover', 'wait',
    'screenshot', 'assert', 'api-call', 'db-query', 'custom',
  ]),
  params: z.record(z.unknown()),
});

const testCaseSchema = z.object({
  title: z.string(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  steps: z.array(stepSchema),
  expectedAssertions: z.array(assertionSchema),
  tags: z.array(z.string()),
});

const suiteSchema = z.object({
  name: z.string(),
  description: z.string(),
  testCases: z.array(testCaseSchema),
});

const generatedSuitesSchema = z.array(suiteSchema);

// ── Page structure extraction ────────────────────────────────

interface PageStructure {
  url: string;
  title: string;
  metaDescription: string;
  links: Array<{ text: string; href: string }>;
  forms: Array<{
    action: string;
    method: string;
    inputs: Array<{ name: string; type: string; placeholder: string; required: boolean }>;
    buttons: Array<{ text: string; type: string }>;
  }>;
  buttons: Array<{ text: string; selector: string }>;
  inputs: Array<{ name: string; type: string; placeholder: string; selector: string }>;
  navigation: Array<{ text: string; href: string }>;
  headings: Array<{ level: number; text: string }>;
  images: number;
  tables: number;
}

async function extractPageStructure(url: string): Promise<PageStructure> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Wait a bit for any JS rendering
    await page.waitForTimeout(2000);

    const structure = await page.evaluate(() => {
      const getSelector = (el: Element): string => {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === 'string') {
          const cls = el.className.trim().split(/\s+/).slice(0, 2).join('.');
          if (cls) return `${el.tagName.toLowerCase()}.${cls}`;
        }
        return el.tagName.toLowerCase();
      };

      // Links
      const links = Array.from(document.querySelectorAll('a[href]'))
        .slice(0, 50)
        .map((a) => ({
          text: (a as HTMLAnchorElement).textContent?.trim().slice(0, 100) || '',
          href: (a as HTMLAnchorElement).href,
        }))
        .filter((l) => l.text);

      // Forms
      const forms = Array.from(document.querySelectorAll('form')).slice(0, 10).map((form) => ({
        action: (form as HTMLFormElement).action || '',
        method: (form as HTMLFormElement).method || 'get',
        inputs: Array.from(form.querySelectorAll('input, textarea, select')).slice(0, 20).map((inp) => ({
          name: (inp as HTMLInputElement).name || '',
          type: (inp as HTMLInputElement).type || inp.tagName.toLowerCase(),
          placeholder: (inp as HTMLInputElement).placeholder || '',
          required: (inp as HTMLInputElement).required || false,
        })),
        buttons: Array.from(form.querySelectorAll('button, input[type="submit"]')).map((btn) => ({
          text: btn.textContent?.trim().slice(0, 50) || (btn as HTMLInputElement).value || '',
          type: (btn as HTMLButtonElement).type || 'button',
        })),
      }));

      // Standalone buttons (not in forms)
      const buttons = Array.from(document.querySelectorAll('button'))
        .filter((btn) => !btn.closest('form'))
        .slice(0, 30)
        .map((btn) => ({
          text: btn.textContent?.trim().slice(0, 50) || '',
          selector: getSelector(btn),
        }))
        .filter((b) => b.text);

      // Standalone inputs (not in forms)
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'))
        .filter((inp) => !inp.closest('form'))
        .slice(0, 30)
        .map((inp) => ({
          name: (inp as HTMLInputElement).name || '',
          type: (inp as HTMLInputElement).type || inp.tagName.toLowerCase(),
          placeholder: (inp as HTMLInputElement).placeholder || '',
          selector: getSelector(inp),
        }));

      // Navigation
      const navElements = document.querySelectorAll('nav a, [role="navigation"] a, header a');
      const navigation = Array.from(navElements).slice(0, 20).map((a) => ({
        text: (a as HTMLAnchorElement).textContent?.trim().slice(0, 100) || '',
        href: (a as HTMLAnchorElement).href,
      })).filter((n) => n.text);

      // Headings
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'))
        .slice(0, 20)
        .map((h) => ({
          level: parseInt(h.tagName[1] ?? '0'),
          text: h.textContent?.trim().slice(0, 200) || '',
        }))
        .filter((h) => h.text);

      const metaDesc = document.querySelector('meta[name="description"]');

      return {
        title: document.title,
        metaDescription: metaDesc?.getAttribute('content') || '',
        links,
        forms,
        buttons,
        inputs,
        navigation,
        headings,
        images: document.querySelectorAll('img').length,
        tables: document.querySelectorAll('table').length,
      };
    });

    return { url, ...structure };
  } finally {
    await context.close();
    await browser.close();
  }
}

// ── System prompt ────────────────────────────────────────────

function buildSystemPrompt(structure: PageStructure, targetType: string): string {
  return `You are an expert QA engineer generating automated test suites for a web application.

## Page Analysis

**URL:** ${structure.url}
**Title:** ${structure.title}
**Meta Description:** ${structure.metaDescription || 'None'}

### Navigation Items (${structure.navigation.length})
${structure.navigation.map((n) => `- "${n.text}" -> ${n.href}`).join('\n') || 'None found'}

### Headings
${structure.headings.map((h) => `${'#'.repeat(h.level)} ${h.text}`).join('\n') || 'None found'}

### Links (${structure.links.length} total, showing first 30)
${structure.links.slice(0, 30).map((l) => `- "${l.text}" -> ${l.href}`).join('\n') || 'None found'}

### Forms (${structure.forms.length})
${structure.forms.map((f, i) => `Form ${i + 1}: action="${f.action}" method="${f.method}"
  Inputs: ${f.inputs.map((inp) => `${inp.name}(${inp.type}${inp.required ? ', required' : ''}${inp.placeholder ? `, placeholder="${inp.placeholder}"` : ''})`).join(', ') || 'None'}
  Buttons: ${f.buttons.map((b) => `"${b.text}"(${b.type})`).join(', ') || 'None'}`).join('\n') || 'None found'}

### Standalone Buttons (${structure.buttons.length})
${structure.buttons.slice(0, 20).map((b) => `- "${b.text}" (${b.selector})`).join('\n') || 'None found'}

### Standalone Inputs (${structure.inputs.length})
${structure.inputs.slice(0, 20).map((inp) => `- ${inp.name || inp.selector}(${inp.type}${inp.placeholder ? `, placeholder="${inp.placeholder}"` : ''})`).join('\n') || 'None found'}

### Other Elements
- Images: ${structure.images}
- Tables: ${structure.tables}

## Instructions

Generate 2-4 test suites covering different aspects of this application:

1. **Smoke Tests** — Basic page loads, navigation works, key elements visible
2. **Form & Input Tests** — If forms exist, test submissions, validation, required fields
3. **Navigation Tests** — Links work, navigation items lead to correct pages
4. **Error Handling** — Invalid inputs, missing required fields, edge cases

Each suite should have 3-8 test cases. Each test case must include:

- **title**: Clear, descriptive test name
- **priority**: CRITICAL for core flows, HIGH for important features, MEDIUM for standard checks, LOW for edge cases
- **steps**: Array of step objects with type and params. Use these step types:
  - \`navigate\`: params \`{ url: "..." }\`
  - \`click\`: params \`{ selector: "..." }\`
  - \`fill\`: params \`{ selector: "...", value: "..." }\`
  - \`assert\`: params \`{ type: "visible", selector: "..." }\`
  - \`screenshot\`: params \`{ name: "..." }\`
  - \`wait\`: params \`{ ms: 1000 }\`
  - \`select\`: params \`{ selector: "...", value: "..." }\`
- **expectedAssertions**: What to verify after the steps. Use these assertion types:
  - \`visible\`: target is a CSS selector, expected is true
  - \`not-visible\`: target is a CSS selector, expected is false
  - \`contains\`: target is a CSS selector, expected is the text substring
  - \`equals\`: target is a CSS selector, expected is the exact text
  - \`status-code\`: expected is the HTTP status code (e.g. 200)
- **tags**: Array of relevant tags like "smoke", "regression", "form", "navigation", "error-handling"

Use REAL selectors and values from the page structure above. The target type is "${targetType}".

Return ONLY valid JSON matching the schema — an array of suite objects.`;
}

// ── Main generator function ──────────────────────────────────

export async function generateTests(
  options: GenerateTestsOptions
): Promise<{ suites: Array<{ id: string; name: string; testCaseCount: number }> }> {
  const { url, projectId, orgSlug, targetType = 'WEB', onProgress } = options;

  onProgress?.({ type: 'crawl:start', message: `Navigating to ${url}...` });

  // 1. Crawl the page
  const structure = await extractPageStructure(url);

  onProgress?.({
    type: 'crawl:done',
    message: `Found ${structure.links.length} links, ${structure.forms.length} forms, ${structure.buttons.length} buttons`,
  });

  // 2. Generate tests via AI
  onProgress?.({ type: 'ai:start', message: 'AI is analyzing the page and generating test cases...' });

  const provider = getProvider('anthropic');
  const systemPrompt = buildSystemPrompt(structure, targetType);

  const result = await (generateText as any)({
    model: provider('claude-sonnet-4-6'),
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyze the page structure above and generate comprehensive test suites. Return a JSON array of test suite objects.`,
      },
    ],
    maxSteps: 1,
    experimental_output: Output.object({ schema: generatedSuitesSchema }),
  });

  const generatedSuites = result.experimental_output;

  if (!generatedSuites || !Array.isArray(generatedSuites) || generatedSuites.length === 0) {
    throw new Error('AI did not return valid test suites');
  }

  onProgress?.({
    type: 'ai:done',
    message: `Generated ${generatedSuites.length} test suites`,
  });

  // 3. Persist to database
  onProgress?.({ type: 'persist:start', message: 'Saving test suites and cases to database...' });

  const createdSuites: Array<{ id: string; name: string; testCaseCount: number }> = [];

  for (const suite of generatedSuites) {
    // Create test suite
    const slug = slugify(suite.name);

    // Check for existing slug and make unique if needed
    const existing = await db.testSuite.findUnique({
      where: { projectId_slug: { projectId, slug } },
    });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const createdSuite = await db.testSuite.create({
      data: {
        projectId,
        name: suite.name,
        slug: finalSlug,
        description: suite.description,
        targetType,
      },
    });

    // Create test cases
    for (let i = 0; i < suite.testCases.length; i++) {
      const tc = suite.testCases[i];
      await db.testCase.create({
        data: {
          suiteId: createdSuite.id,
          title: tc.title,
          targetType,
          priority: tc.priority,
          position: i,
          steps: tc.steps as any,
          expectedAssertions: tc.expectedAssertions as any,
          tags: tc.tags,
        },
      });
    }

    createdSuites.push({
      id: createdSuite.id,
      name: createdSuite.name,
      testCaseCount: suite.testCases.length,
    });
  }

  onProgress?.({
    type: 'persist:done',
    message: `Saved ${createdSuites.length} suites with ${createdSuites.reduce((sum, s) => sum + s.testCaseCount, 0)} total test cases`,
  });

  return { suites: createdSuites };
}
