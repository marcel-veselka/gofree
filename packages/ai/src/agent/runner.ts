import { db } from '@gofree/db';
import { executeAgent } from './executor';
import { getToolsForTarget } from './tools';
import type { ProviderName } from '../providers/registry';

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

    // Render the prompt template
    const templateVars: Record<string, any> = {
      testCase: {
        title: testCase.title,
        steps: JSON.stringify(testCase.steps ?? []),
        expectedAssertions: JSON.stringify(testCase.expectedAssertions ?? []),
      },
      environment: {
        baseUrl: envConfig.baseUrl ?? '',
      },
      suite: {
        name: testSuite.name,
      },
    };

    const systemPrompt = renderTemplate(
      agentDefinition.promptTemplate,
      templateVars
    );

    // Get tools for the target type
    const tools = getToolsForTarget(testCase.targetType);

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
    await db.runStep.createMany({
      data: result.steps.map((step) => ({
        runId,
        index: step.index,
        type: step.type,
        input: step.input as any,
        output: step.output as any,
        error: step.error,
        startedAt: step.startedAt,
        completedAt: step.completedAt,
      })),
    });

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
