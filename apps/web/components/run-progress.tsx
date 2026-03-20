'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface RunEvent {
  type: string;
  [key: string]: unknown;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  PASSED: 'bg-green-100 text-green-800',
  ERROR: 'bg-red-100 text-red-800',
};

export function RunProgress({ runId }: { runId: string }) {
  const [status, setStatus] = useState('PENDING');
  const [completedCases, setCompletedCases] = useState(0);
  const [totalCases, setTotalCases] = useState(0);
  const [passed, setPassed] = useState(0);
  const [failed, setFailed] = useState(0);
  const [currentCase, setCurrentCase] = useState<string | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/api/runs/${runId}/stream`);

    eventSource.onmessage = (e) => {
      try {
        const event: RunEvent = JSON.parse(e.data);

        switch (event.type) {
          case 'run:snapshot':
            setStatus(event.status as string);
            setCompletedCases(event.completedCases as number);
            setTotalCases(event.totalCases as number);
            break;

          case 'run:started':
            setStatus('RUNNING');
            setTotalCases(event.totalCases as number);
            break;

          case 'case:started':
            setCurrentCase(event.title as string);
            break;

          case 'case:completed': {
            const caseStatus = event.status as string;
            setCompletedCases((prev) => prev + 1);
            if (caseStatus === 'PASSED') setPassed((prev) => prev + 1);
            if (caseStatus === 'FAILED' || caseStatus === 'ERROR') setFailed((prev) => prev + 1);
            setCurrentCase(null);
            break;
          }

          case 'run:completed':
            setStatus(event.status as string);
            setPassed(event.passed as number);
            setFailed(event.failed as number);
            eventSource.close();
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [runId]);

  const isRunning = status === 'RUNNING';
  const isDone = status === 'COMPLETED' || status === 'FAILED';

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          )}
          <span className="text-sm font-medium">
            {isRunning ? 'Running...' : isDone ? 'Run complete' : 'Pending...'}
          </span>
          <Badge variant="secondary" className={STATUS_COLORS[status]}>
            {status}
          </Badge>
        </div>
        {totalCases > 0 && (
          <span className="text-xs text-muted-foreground">
            {completedCases}/{totalCases} cases
          </span>
        )}
      </div>

      {/* Progress bar */}
      {totalCases > 0 && (
        <div className="mt-3 h-2 w-full rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${(completedCases / totalCases) * 100}%` }}
          />
        </div>
      )}

      {/* Current case */}
      {currentCase && (
        <p className="mt-2 text-xs text-muted-foreground">
          Testing: {currentCase}
        </p>
      )}

      {/* Summary */}
      {(passed > 0 || failed > 0) && (
        <div className="mt-2 flex gap-3 text-xs">
          <span className="text-green-600">{passed} passed</span>
          {failed > 0 && <span className="text-red-600">{failed} failed</span>}
        </div>
      )}
    </div>
  );
}
