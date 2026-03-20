import { z } from 'zod';

// ── Target Type Configs ─────────────────────────────────────

export const webTargetConfigSchema = z.object({
  baseUrl: z.string().url().optional(),
  browser: z.enum(['chromium', 'firefox', 'webkit']).default('chromium'),
  viewport: z.object({ width: z.number(), height: z.number() }).optional(),
  headless: z.boolean().default(true),
});

export const mobileTargetConfigSchema = z.object({
  platform: z.enum(['ios', 'android']),
  device: z.string(),
  appBundle: z.string().optional(),
  appUrl: z.string().url().optional(),
});

export const desktopTargetConfigSchema = z.object({
  platform: z.enum(['windows', 'macos', 'linux']),
  appPath: z.string(),
  launchArgs: z.array(z.string()).default([]),
});

export const apiTargetConfigSchema = z.object({
  baseUrl: z.string().url(),
  defaultHeaders: z.record(z.string()).default({}),
  authType: z.enum(['none', 'bearer', 'basic', 'api-key']).default('none'),
});

export const databaseTargetConfigSchema = z.object({
  dialect: z.enum(['postgresql', 'mysql', 'sqlite', 'mongodb', 'mssql']),
  connectionString: z.string().optional(), // resolved from environment secrets
  query: z.string().optional(),
});

export const crossPlatformTargetConfigSchema = z.object({
  targets: z.array(z.enum(['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE'])),
  configs: z.record(z.unknown()).default({}),
});

export const targetConfigSchema = z.union([
  webTargetConfigSchema,
  mobileTargetConfigSchema,
  desktopTargetConfigSchema,
  apiTargetConfigSchema,
  databaseTargetConfigSchema,
  crossPlatformTargetConfigSchema,
]);

// ── Test Suite Config ───────────────────────────────────────

export const testSuiteConfigSchema = z.object({
  schedule: z.string().optional(), // cron expression
  parallelism: z.number().int().min(1).max(50).default(1),
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).max(5).default(0),
    retryOnFlaky: z.boolean().default(true),
  }).optional(),
  defaultEnvironmentId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

// ── Test Case Steps ─────────────────────────────────────────

export const testStepSchema = z.object({
  type: z.enum([
    'navigate', 'click', 'fill', 'select', 'hover', 'wait',
    'screenshot', 'assert', 'api-call', 'db-query', 'custom',
  ]),
  params: z.record(z.unknown()).default({}),
  description: z.string().optional(),
});

export const testCaseStepsSchema = z.array(testStepSchema);

// ── Test Case Assertions ────────────────────────────────────

export const assertionDefinitionSchema = z.object({
  type: z.enum([
    'equals', 'contains', 'matches', 'visible', 'not-visible',
    'status-code', 'json-path', 'row-count', 'visual',
    'accessibility', 'performance', 'custom',
  ]),
  target: z.string().optional(), // selector, json path, query
  expected: z.unknown(),
  tolerance: z.number().optional(), // for visual/performance
  description: z.string().optional(),
});

export const testCaseAssertionsSchema = z.array(assertionDefinitionSchema);

// ── Environment Config & Secrets ────────────────────────────

export const environmentConfigSchema = z.object({
  baseUrl: z.string().url().optional(),
  browser: z.enum(['chromium', 'firefox', 'webkit']).optional(),
  viewport: z.object({ width: z.number(), height: z.number() }).optional(),
  device: z.string().optional(),
  platform: z.string().optional(),
  defaultHeaders: z.record(z.string()).optional(),
  connectionString: z.string().optional(),
  custom: z.record(z.unknown()).optional(),
});

export const environmentSecretsSchema = z.object({
  apiKeys: z.record(z.string()).optional(),
  passwords: z.record(z.string()).optional(),
  tokens: z.record(z.string()).optional(),
  connectionStrings: z.record(z.string()).optional(),
  custom: z.record(z.string()).optional(),
});

// ── Agent Definition ────────────────────────────────────────

export const agentToolsSchema = z.array(z.string()); // tool identifiers

export const agentDefaultConfigSchema = z.object({
  maxSteps: z.number().int().min(1).max(500).default(50),
  timeoutMs: z.number().int().min(5000).max(600000).default(300000),
  retryPolicy: z.object({
    maxRetries: z.number().int().min(0).max(5).default(1),
    retryOnFlaky: z.boolean().default(true),
  }).optional(),
  screenshotOnFailure: z.boolean().default(true),
  screenshotOnStep: z.boolean().default(false),
});

// ── Test Result Screenshots ─────────────────────────────────

export const screenshotRefSchema = z.object({
  name: z.string(),
  storagePath: z.string(),
  capturedAt: z.string().datetime(),
  stepIndex: z.number().int().optional(),
  assertionName: z.string().optional(),
});

export const testResultScreenshotsSchema = z.array(screenshotRefSchema);

// ── Type Exports ────────────────────────────────────────────

export type WebTargetConfig = z.infer<typeof webTargetConfigSchema>;
export type MobileTargetConfig = z.infer<typeof mobileTargetConfigSchema>;
export type DesktopTargetConfig = z.infer<typeof desktopTargetConfigSchema>;
export type ApiTargetConfig = z.infer<typeof apiTargetConfigSchema>;
export type DatabaseTargetConfig = z.infer<typeof databaseTargetConfigSchema>;
export type TestSuiteConfig = z.infer<typeof testSuiteConfigSchema>;
export type TestStep = z.infer<typeof testStepSchema>;
export type AssertionDefinition = z.infer<typeof assertionDefinitionSchema>;
export type EnvironmentConfig = z.infer<typeof environmentConfigSchema>;
export type EnvironmentSecrets = z.infer<typeof environmentSecretsSchema>;
export type AgentDefaultConfig = z.infer<typeof agentDefaultConfigSchema>;
export type ScreenshotRef = z.infer<typeof screenshotRefSchema>;
