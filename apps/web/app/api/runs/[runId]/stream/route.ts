import { db } from '@gofree/db';
import { createSSEStream, sendSSEEvent } from '@gofree/realtime';
import { subscribeToRun, type RunEvent } from '@gofree/realtime';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  const { runId } = await params;

  // Send current state as initial snapshot
  const run = await db.run.findUnique({
    where: { id: runId },
    include: {
      testResults: {
        select: { testCaseId: true, status: true },
        orderBy: { createdAt: 'asc' },
      },
      testSuite: {
        include: { _count: { select: { testCases: true } } },
      },
    },
  });

  if (!run) {
    return new Response('Run not found', { status: 404 });
  }

  const { stream, controller } = createSSEStream();

  // Send snapshot
  const snapshot: RunEvent = {
    type: 'run:snapshot',
    runId,
    status: run.status,
    completedCases: run.testResults.length,
    totalCases: run.testSuite?._count.testCases ?? 0,
    results: run.testResults.map((r) => ({
      caseId: r.testCaseId,
      status: r.status,
    })),
  };
  sendSSEEvent(controller, snapshot);

  // If run is already done, close the stream
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(run.status)) {
    controller.close();
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  }

  // Subscribe to live updates
  let unsubscribe: (() => Promise<void>) | null = null;

  try {
    unsubscribe = await subscribeToRun(runId, (event) => {
      try {
        sendSSEEvent(controller, event);
        if (event.type === 'run:completed') {
          controller.close();
          unsubscribe?.();
        }
      } catch {
        // Stream closed by client
        unsubscribe?.();
      }
    });
  } catch {
    // Redis not available — just close after snapshot
    controller.close();
  }

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
