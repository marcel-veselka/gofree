'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { Badge } from '@/components/ui/badge';

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-yellow-100 text-yellow-800',
};

const RESULT_STATUS_COLORS: Record<string, string> = {
  PASSED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  SKIPPED: 'bg-gray-100 text-gray-800',
  FLAKY: 'bg-yellow-100 text-yellow-800',
  ERROR: 'bg-red-100 text-red-800',
};

const TARGET_COLORS: Record<string, string> = {
  WEB: 'bg-blue-100 text-blue-800',
  MOBILE: 'bg-green-100 text-green-800',
  DESKTOP: 'bg-purple-100 text-purple-800',
  API: 'bg-orange-100 text-orange-800',
  DATABASE: 'bg-red-100 text-red-800',
  CROSS_PLATFORM: 'bg-pink-100 text-pink-800',
};

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return '--';
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}m ${remaining}s`;
}

function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString();
}

export function RunDetail({
  orgSlug,
  projectSlug,
  runId,
}: {
  orgSlug: string;
  projectSlug: string;
  runId: string;
}) {
  const { data: run } = trpc.run.getById.useQuery({ orgSlug, runId });
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [stepsOpen, setStepsOpen] = useState(false);

  if (!run) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  const durationMs =
    run.startedAt && run.completedAt
      ? new Date(run.completedAt).getTime() - new Date(run.startedAt).getTime()
      : null;

  const toggleResult = (id: string) => {
    setExpandedResults((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      {run.testSuite && (
        <div className="mb-4 text-sm text-muted-foreground">
          <Link
            href={`/${orgSlug}/${projectSlug}/suites/${run.testSuite.slug}`}
            className="hover:underline"
          >
            {run.testSuite.name}
          </Link>
          <span className="mx-2">/</span>
          <span>Run</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Run Details</h1>
          <Badge variant="secondary" className={STATUS_COLORS[run.status]}>
            {run.status}
          </Badge>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Started</p>
          <p className="mt-1 text-sm font-semibold">
            {run.startedAt ? formatDateTime(run.startedAt) : '--'}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Completed</p>
          <p className="mt-1 text-sm font-semibold">
            {run.completedAt ? formatDateTime(run.completedAt) : '--'}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Duration</p>
          <p className="mt-1 text-sm font-semibold">{formatDuration(durationMs)}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Token usage</p>
          <p className="mt-1 text-sm font-semibold">
            {run.tokenUsage != null ? run.tokenUsage.toLocaleString() : '--'}
          </p>
        </div>
      </div>

      {/* Test Results */}
      <div className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-base font-semibold">
            Test Results ({run.testResults.length})
          </h2>
        </div>
        {run.testResults.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No test results yet.
          </div>
        ) : (
          <div className="divide-y">
            {run.testResults.map((result) => {
              const isExpanded = expandedResults.has(result.id);
              return (
                <div key={result.id}>
                  <button
                    onClick={() => toggleResult(result.id)}
                    className="flex w-full items-center justify-between px-6 py-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-medium">
                        {result.testCase?.title ?? 'Untitled'}
                      </span>
                      <Badge
                        variant="secondary"
                        className={RESULT_STATUS_COLORS[result.status] ?? 'bg-gray-100 text-gray-800'}
                      >
                        {result.status}
                      </Badge>
                      {result.testCase?.targetType && (
                        <Badge
                          variant="secondary"
                          className={`${TARGET_COLORS[result.testCase.targetType]} text-[10px]`}
                        >
                          {result.testCase.targetType}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(result.durationMs)}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="border-t bg-muted/10 px-6 py-4">
                      {/* Error message */}
                      {result.errorMessage && (
                        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                          <p className="text-xs font-medium text-red-800">Error</p>
                          <pre className="mt-1 whitespace-pre-wrap text-xs text-red-700">
                            {result.errorMessage}
                          </pre>
                        </div>
                      )}

                      {/* Assertions table */}
                      {result.assertions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-xs font-medium text-muted-foreground">
                                <th className="px-3 py-2 text-left">Name</th>
                                <th className="px-3 py-2 text-left">Type</th>
                                <th className="px-3 py-2 text-left">Result</th>
                                <th className="px-3 py-2 text-left">Expected</th>
                                <th className="px-3 py-2 text-left">Actual</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {result.assertions.map((assertion) => (
                                <tr key={assertion.id} className="text-xs">
                                  <td className="px-3 py-2 font-medium">{assertion.name}</td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {assertion.type}
                                  </td>
                                  <td className="px-3 py-2">
                                    <Badge
                                      variant="secondary"
                                      className={
                                        assertion.passed
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                      }
                                    >
                                      {assertion.passed ? 'PASSED' : 'FAILED'}
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {assertion.expected ?? '--'}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {assertion.actual ?? '--'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No assertions recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Run Steps (collapsible) */}
      {run.steps && Array.isArray(run.steps) && (run.steps as unknown[]).length > 0 && (
        <div className="mt-6 rounded-xl border bg-card shadow-sm">
          <button
            onClick={() => setStepsOpen(!stepsOpen)}
            className="flex w-full items-center justify-between border-b px-6 py-4 text-left hover:bg-muted/30 transition-colors"
          >
            <h2 className="text-base font-semibold">
              Run Steps ({(run.steps as unknown[]).length})
            </h2>
            <svg
              className={`h-4 w-4 text-muted-foreground transition-transform ${stepsOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {stepsOpen && (
            <div className="divide-y">
              {(run.steps as Array<{ description?: string; status?: string; timestamp?: string }>).map(
                (step, i) => (
                  <div key={i} className="flex items-center gap-3 px-6 py-3 text-sm">
                    <span className="text-xs text-muted-foreground">{i + 1}.</span>
                    <span>{step.description ?? JSON.stringify(step)}</span>
                    {step.status && (
                      <Badge
                        variant="secondary"
                        className={RESULT_STATUS_COLORS[step.status] ?? 'bg-gray-100 text-gray-800'}
                      >
                        {step.status}
                      </Badge>
                    )}
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
