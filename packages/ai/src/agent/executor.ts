import { generateText } from 'ai';
import { getProvider } from '../providers/registry';
import type { ProviderName } from '../providers/registry';

interface ExecutorOptions {
  provider: ProviderName;
  model: string;
  systemPrompt: string;
  tools: Record<string, any>;
  maxSteps: number;
  timeoutMs: number;
  onStep?: (step: {
    index: number;
    type: string;
    input?: unknown;
    output?: unknown;
  }) => Promise<void>;
}

interface StepRecord {
  index: number;
  type: string;
  input?: unknown;
  output?: unknown;
  error?: string;
  startedAt: Date;
  completedAt: Date;
}

interface AssertionRecord {
  name: string;
  type: string;
  expected: unknown;
  actual: unknown;
  passed: boolean;
}

export interface ExecutorResult {
  steps: StepRecord[];
  assertions: AssertionRecord[];
  totalTokens: { prompt: number; completion: number };
  error?: string;
}

function isAssertionResult(
  value: unknown
): value is { name: string; type: string; passed: boolean; expected: unknown; actual: unknown } {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.passed === 'boolean' &&
    'expected' in obj &&
    'actual' in obj
  );
}

export async function executeAgent(
  options: ExecutorOptions
): Promise<ExecutorResult> {
  const steps: StepRecord[] = [];
  const assertions: AssertionRecord[] = [];
  const totalTokens = { prompt: 0, completion: 0 };

  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    abortController.abort();
  }, options.timeoutMs);

  try {
    const provider = getProvider(options.provider);

    const response = await generateText({
      model: provider(options.model),
      system: options.systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Execute the test case according to the system prompt instructions.',
        },
      ],
      tools: options.tools,
      maxSteps: options.maxSteps,
      abortSignal: abortController.signal,
    });

    // Extract step data from the response
    for (let i = 0; i < response.steps.length; i++) {
      const step = response.steps[i];
      const startedAt = new Date();
      const completedAt = new Date();

      if (step.toolCalls && step.toolCalls.length > 0) {
        for (const toolCall of step.toolCalls) {
          const toolResult = step.toolResults?.find(
            (r: any) => r.toolCallId === toolCall.toolCallId
          );

          const stepRecord: StepRecord = {
            index: steps.length,
            type: `tool:${toolCall.toolName}`,
            input: toolCall.args,
            output: toolResult?.result,
            startedAt,
            completedAt,
          };

          steps.push(stepRecord);

          if (options.onStep) {
            await options.onStep({
              index: stepRecord.index,
              type: stepRecord.type,
              input: stepRecord.input,
              output: stepRecord.output,
            });
          }

          // Check if tool result is an assertion
          if (toolResult?.result && isAssertionResult(toolResult.result)) {
            assertions.push({
              name: toolResult.result.name ?? toolCall.toolName,
              type: toolResult.result.type ?? toolCall.toolName,
              expected: toolResult.result.expected,
              actual: toolResult.result.actual,
              passed: toolResult.result.passed,
            });
          }
        }
      } else {
        // Text generation step
        const stepRecord: StepRecord = {
          index: steps.length,
          type: 'text',
          output: step.text,
          startedAt,
          completedAt,
        };

        steps.push(stepRecord);

        if (options.onStep) {
          await options.onStep({
            index: stepRecord.index,
            type: stepRecord.type,
            output: stepRecord.output,
          });
        }
      }
    }

    // Track token usage
    totalTokens.prompt = response.usage?.promptTokens ?? 0;
    totalTokens.completion = response.usage?.completionTokens ?? 0;

    return { steps, assertions, totalTokens };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Unknown executor error';
    return { steps, assertions, totalTokens, error: message };
  } finally {
    clearTimeout(timeout);
  }
}
