import type { SSEEvent } from '@gofree/core';

/**
 * Create an SSE response stream.
 */
export function createSSEStream(): {
  stream: ReadableStream;
  controller: ReadableStreamDefaultController;
} {
  let controller!: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
    },
  });

  return { stream, controller };
}

/**
 * Send an SSE event to a stream controller.
 */
export function sendSSEEvent(controller: ReadableStreamDefaultController, event: SSEEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  controller.enqueue(new TextEncoder().encode(data));
}
