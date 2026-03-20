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

    const response = await (generateText as any)({
      model: provider(options.model),
      system: options.systemPrompt,
      messages: [
        {
          role: 'user',
          content: 'Execute the test case according to the system prompt instructions. You MUST call tools for every step and assertion. Call reportResult as the final tool call.',
        },
      ],
      tools: options.tools,
      maxSteps: options.maxSteps,
      abortSignal: abortController.signal,
      toolChoice: 'required',
      stopWhen: (event: any) => {
        if (!event.steps || event.steps.length === 0) return false;
        const lastStep = event.steps[event.steps.length - 1];
        return lastStep.toolCalls?.some(
          (tc: any) => tc.toolName === 'reportResult'
        ) ?? false;
      },
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

          const toolInput = toolCall.args ?? (toolResult as any)?.input ?? null;
          // AI SDK v3 uses .output, v2 used .result
          const toolOutput = (toolResult as any)?.output ?? toolResult?.result ?? null;


          const stepRecord: StepRecord = {
            index: steps.length,
            type: `tool:${toolCall.toolName}`,
            input: toolInput,
            output: toolOutput,
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
          if (toolOutput && isAssertionResult(toolOutput)) {
            assertions.push({
              name: (toolOutput as any).name ?? toolCall.toolName,
              type: (toolOutput as any).type ?? toolCall.toolName,
              expected: (toolOutput as any).expected,
              actual: (toolOutput as any).actual,
              passed: (toolOutput as any).passed,
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
