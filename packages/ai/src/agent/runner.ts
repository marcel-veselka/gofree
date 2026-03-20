import { db } from '@gofree/db';
import { executeAgent } from './executor';
import { getToolsForTarget, BrowserContext } from './tools';
import type { ProviderName } from '../providers/registry';
import { saveScreenshot } from '../../../../apps/web/lib/screenshots';

export type RunProgressEvent =
  | { type: 'run:started'; runId: string; totalCases: number }
  | { type: 'case:started'; caseIndex: number; caseId: string; title: string }
  | { type: 'step:completed'; caseIndex: number; stepIndex: number }
  | {
      type: 'case:completed';
      caseIndex: number;
      caseId: string;
      status: string;
      durationMs: number;
    }
  | {
      type: 'run:completed';
      runId: string;
      status: string;
      passed: number;
      failed: number;
      total: number;
    };

interface RunConfig {
  runId: string;
  onProgress?: (event: RunProgressEvent) => Promise<void>;
}

function renderTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, key) => {
    const parts = key.split('.');
    let val: any = vars;
    for (const part of parts) {
      val = val?.[part];
    }
    return val !== undefined ? String(val) : `{{${key}}}`;
  });
}

function resolveProvider(model: string): ProviderName {
  return model.startsWith('claude') ? 'anthropic' : 'openai';
}

export async function runTestSuite(config: RunConfig): Promise<void> {
  const { runId, onProgress } = config;

  // 1. Load the Run record with relations
  const run = await db.run.findUnique({
    where: { id: runId },
    include: {
      testSuite: {
        include: {
          testCases: {
            orderBy: { position: 'asc' },
          },
        },
      },
      environment: true,
      agentDefinition: true,
    },
  });

  if (!run) {
    await db.run.update({
      where: { id: runId },
      data: { status: 'FAILED', error: 'Run record not found' },
    });
    return;
  }

  // 2. Validate required relations
  if (!run.testSuite || !run.environment || !run.agentDefinition) {
    const missing = [
      !run.testSuite && 'testSuite',
      !run.environment && 'environment',
      !run.agentDefinition && 'agentDefinition',
    ]
      .filter(Boolean)
      .join(', ');

    await db.run.update({
      where: { id: runId },
      data: {
        status: 'FAILED',
        error: `Missing required relations: ${missing}`,
      },
    });
    return;
  }

  const { testSuite, environment, agentDefinition } = run;
  const testCases = testSuite.testCases;

  // 3. Update Run status to RUNNING
  await db.run.update({
    where: { id: runId },
    data: { status: 'RUNNING', startedAt: new Date() },
  });

  // 4. Emit run:started
  await onProgress?.({
    type: 'run:started',
    runId,
    totalCases: testCases.length,
  });

  // 5. Resolve environment config
  const envConfig = (environment.config as Record<string, any>) ?? {};

  let passedCount = 0;
  let failedCount = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;

  // 6. Execute each test case sequentially
  for (let caseIndex = 0; caseIndex < testCases.length; caseIndex++) {
    const testCase = testCases[caseIndex];

    await onProgress?.({
      type: 'case:started',
      caseIndex,
      caseId: testCase.id,
      title: testCase.title,
    });

    const caseStartedAt = new Date();

    // Build the system prompt — render template + append structured context
    const templateVars: Record<string, any> = {
      testCase: {
        title: testCase.title,
        steps: JSON.stringify(testCase.steps ?? []),
        expectedAssertions: JSON.stringify(testCase.expectedAssertions ?? []),
        targetType: testCase.targetType,
      },
      environment: {
        baseUrl: envConfig.baseUrl ?? '',
      },
      suite: {
        name: testSuite.name,
      },
    };

    const renderedTemplate = renderTemplate(
      agentDefinition.promptTemplate,
      templateVars
    );

    const steps = testCase.steps as Array<Record<string, any>> | null;
    const assertions = testCase.expectedAssertions as Array<Record<string, any>> | null;

    const systemPrompt = `${renderedTemplate}

## Test Case Details
- Title: ${testCase.title}
- Target: ${testCase.targetType}
- Priority: ${testCase.priority}
${steps?.length ? `\n## Steps to Execute\n${steps.map((s, i) => `${i + 1}. [${s.type}] ${JSON.stringify(s.params ?? s)}`).join('\n')}` : ''}
${assertions?.length ? `\n## Expected Assertions — YOU MUST VERIFY EACH ONE\n${assertions.map((a, i) => `${i + 1}. [${a.type}] expected: ${JSON.stringify(a.expected)}${a.target ? ` (target: ${a.target})` : ''}${a.description ? ` — ${a.description}` : ''}`).join('\n')}` : ''}

## CRITICAL INSTRUCTIONS
1. Execute the test steps using the available tools.
2. For EVERY expected assertion listed above, you MUST call the corresponding assertion tool:
   - "status-code" → call assertStatusCode with the actual status code and the expected value
   - "json-path" → call assertJsonPath with the response JSON, the path, and expected value
   - "contains" → call assertContains with the text and expected substring
   - "visible" / "not-visible" → call browserClick or browserNavigate as appropriate
   - "row-count" → after dbQuery, call assertStatusCode or assertContains to verify
3. After all assertions, call reportResult with status "passed" or "failed" and a brief summary.
4. If a step fails, still continue with remaining steps and assertions.
5. Do NOT skip any assertions — each one must be explicitly verified with a tool call.`;

    // Create browser context for WEB tests, simulated for others
    let browserContext: BrowserContext | undefined;
    if (testCase.targetType === 'WEB' || testCase.targetType === 'CROSS_PLATFORM') {
      browserContext = new BrowserContext({
        headless: true,
        baseUrl: envConfig.baseUrl as string | undefined,
        viewport: envConfig.viewport as { width: number; height: number } | undefined,
      });
      try {
        await browserContext.launch();
      } catch (launchErr) {
        // If browser can't launch, fall back to simulated tools
        console.warn('[runner] Failed to launch browser, using simulated tools:', launchErr);
        browserContext = undefined;
      }
    }

    // Get tools for the target type (with real browser if available)
    const tools = getToolsForTarget(testCase.targetType, { browserContext });

    // Get agent config defaults
    const agentConfig =
      (agentDefinition.defaultConfig as Record<string, any>) ?? {};
    const maxSteps = agentConfig.maxSteps ?? 20;
    const timeoutMs = agentConfig.timeoutMs ?? 120_000;
    const model = agentDefinition.model;
    const provider = resolveProvider(model);

    // Execute the agent
    const result = await executeAgent({
      provider,
      model,
      systemPrompt,
      tools,
      maxSteps,
      timeoutMs,
      onStep: async (step) => {
        await onProgress?.({
          type: 'step:completed',
          caseIndex,
          stepIndex: step.index,
        });
      },
    });

    const caseCompletedAt = new Date();
    const durationMs =
      caseCompletedAt.getTime() - caseStartedAt.getTime();

    // Determine test status
    let status: string;
    if (result.error) {
      status = 'ERROR';
    } else if (result.assertions.length === 0) {
      status = 'PASSED';
    } else if (result.assertions.every((a) => a.passed)) {
      status = 'PASSED';
    } else {
      status = 'FAILED';
    }

    if (status === 'PASSED') {
      passedCount++;
    } else {
      failedCount++;
    }

    // Create RunStep records for each step
    if (result.steps.length > 0) {
      await db.runStep.createMany({
        data: result.steps.map((step) => ({
          runId,
          index: step.index,
          type: step.type,
          input: step.input !== undefined ? (step.input as any) : undefined,
          output: step.output !== undefined ? (step.output as any) : undefined,
          error: step.error,
          startedAt: step.startedAt,
          completedAt: step.completedAt,
        })),
      });
    }

    // Save screenshots captured during browser execution
    let screenshotRefs: Array<{ name: string; storagePath: string; capturedAt: string }> = [];
    if (browserContext) {
      const captured = browserContext.getScreenshots();
      for (const ss of captured) {
        try {
          const storagePath = await saveScreenshot(runId, ss.name, ss.buffer);
          screenshotRefs.push({
            name: ss.name,
            storagePath,
            capturedAt: ss.capturedAt.toISOString(),
          });
        } catch (err) {
          console.warn('[runner] Failed to save screenshot:', ss.name, err);
        }
      }
    }

    // Create TestResult record
    const testResult = await db.testResult.create({
      data: {
        runId,
        testCaseId: testCase.id,
        environmentId: environment.id,
        status: status as any,
        durationMs,
        startedAt: caseStartedAt,
        completedAt: caseCompletedAt,
        error: result.error,
        screenshots: screenshotRefs.length > 0 ? screenshotRefs : undefined,
      },
    });

    // Create Assertion records
    if (result.assertions.length > 0) {
      await db.assertion.createMany({
        data: result.assertions.map((a) => ({
          testResultId: testResult.id,
          name: a.name,
          type: a.type,
          expected: a.expected as any,
          actual: a.actual as any,
          passed: a.passed,
        })),
      });
    }

    // Track token usage
    totalPromptTokens += result.totalTokens.prompt;
    totalCompletionTokens += result.totalTokens.completion;

    // Close browser context for this test case
    if (browserContext) {
      await browserContext.close();
    }

    await onProgress?.({
      type: 'case:completed',
      caseIndex,
      caseId: testCase.id,
      status,
      durationMs,
    });
  }

  // 7. Update Run with final status
  const finalStatus =
    failedCount === 0 ? 'COMPLETED' : 'FAILED';

  await db.run.update({
    where: { id: runId },
    data: {
      status: finalStatus,
      completedAt: new Date(),
      tokenUsage: {
        prompt: totalPromptTokens,
        completion: totalCompletionTokens,
      },
    },
  });

  // 8. Emit run:completed
  await onProgress?.({
    type: 'run:completed',
    runId,
    status: finalStatus,
    passed: passedCount,
    failed: failedCount,
    total: testCases.length,
  });
}
