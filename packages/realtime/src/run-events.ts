import { createClient } from 'redis';

export type RunEvent =
  | { type: 'run:started'; runId: string; totalCases: number }
  | { type: 'case:started'; caseIndex: number; caseId: string; title: string }
  | { type: 'step:completed'; caseIndex: number; stepIndex: number }
  | { type: 'case:completed'; caseIndex: number; caseId: string; status: string; durationMs: number }
  | { type: 'run:completed'; runId: string; status: string; passed: number; failed: number; total: number }
  | { type: 'run:snapshot'; runId: string; status: string; completedCases: number; totalCases: number; results: Array<{ caseId: string; status: string }> };

/**
 * Subscribe to run progress events via Redis pub/sub.
 * Returns an unsubscribe function.
 */
export async function subscribeToRun(
  runId: string,
  callback: (event: RunEvent) => void
): Promise<() => Promise<void>> {
  const channel = `run:${runId}:progress`;

  const subscriber = createClient({ url: process.env.REDIS_URL });
  await subscriber.connect();

  await subscriber.subscribe(channel, (message) => {
    try {
      const event = JSON.parse(message) as RunEvent;
      callback(event);
    } catch {
      // Ignore malformed messages
    }
  });

  return async () => {
    try {
      await subscriber.unsubscribe(channel);
      await subscriber.disconnect();
    } catch {
      // Ignore cleanup errors
    }
  };
}
