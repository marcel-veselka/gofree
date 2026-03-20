import { task } from '@trigger.dev/sdk/v3';
import { runTestSuite } from '@gofree/ai';
import { createClient } from 'redis';

export const agentRunTask = task({
  id: 'ai.agent-run',
  maxDuration: 600, // 10 minutes
  run: async (payload: { runId: string }) => {
    // Create Redis client for progress publishing
    let redis: ReturnType<typeof createClient> | null = null;
    const channel = `run:${payload.runId}:progress`;

    try {
      if (process.env.REDIS_URL) {
        redis = createClient({ url: process.env.REDIS_URL });
        await redis.connect();
      }
    } catch {
      // Redis is optional — run works without live streaming
      redis = null;
    }

    try {
      await runTestSuite({
        runId: payload.runId,
        onProgress: async (event) => {
          if (redis) {
            try {
              await redis.publish(channel, JSON.stringify(event));
            } catch {
              // Ignore publish errors
            }
          }
        },
      });
    } finally {
      if (redis) {
        try {
          await redis.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      }
    }

    return { runId: payload.runId, status: 'completed' };
  },
});
