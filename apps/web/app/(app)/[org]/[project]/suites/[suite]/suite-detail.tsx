'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { CreateDialog } from '@/components/create-dialog';
import { RunProgress } from '@/components/run-progress';
import { Badge } from '@/components/ui/badge';
import { TestCaseEditor } from './test-case-editor';

const TARGET_COLORS: Record<string, string> = {
  WEB: 'bg-blue-100 text-blue-800',
  MOBILE: 'bg-green-100 text-green-800',
  DESKTOP: 'bg-purple-100 text-purple-800',
  API: 'bg-orange-100 text-orange-800',
  DATABASE: 'bg-red-100 text-red-800',
  CROSS_PLATFORM: 'bg-pink-100 text-pink-800',
};

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  LOW: 'bg-gray-100 text-gray-800',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-yellow-100 text-yellow-800',
};

export function SuiteDetail({
  orgSlug,
  projectSlug,
  suiteSlug,
}: {
  orgSlug: string;
  projectSlug: string;
  suiteSlug: string;
}) {
  const { data: suite } = trpc.testSuite.getBySlug.useQuery({ orgSlug, projectSlug, suiteSlug });
  const { data: runHistory } = trpc.testSuite.runHistory.useQuery(
    { orgSlug, suiteId: suite?.id ?? '' },
    { enabled: !!suite?.id }
  );

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [editingTestCaseId, setEditingTestCaseId] = useState<string | null>(null);
  const [showCreateEditor, setShowCreateEditor] = useState(false);

  const utils = trpc.useUtils();
  const archiveSuite = trpc.testSuite.archive.useMutation({
    onSuccess: () => utils.testSuite.getBySlug.invalidate(),
  });
  const triggerRun = trpc.run.trigger.useMutation({
    onSuccess: (data) => {
      setActiveRunId(data.runId);
      utils.testSuite.runHistory.invalidate();
    },
  });

  if (!suite) {
    return <div className="text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{suite.name}</h1>
            <Badge variant="secondary" className={TARGET_COLORS[suite.targetType]}>
              {suite.targetType}
            </Badge>
          </div>
          {suite.description && (
            <p className="mt-1 text-sm text-muted-foreground">{suite.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerRun.mutate({ orgSlug, suiteId: suite.id })}
            disabled={triggerRun.isPending || suite.testCases.length === 0}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {triggerRun.isPending ? 'Starting...' : 'Run suite'}
          </button>
          <button
            onClick={() => setShowCreateEditor(true)}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all"
          >
            Add test case
          </button>
          <button
            onClick={() => archiveSuite.mutate({ orgSlug, suiteId: suite.id, archived: !suite.archived })}
            className="rounded-lg border px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
          >
            {suite.archived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Test cases</p>
          <p className="mt-1 text-2xl font-bold">{suite.testCases.length}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Total runs</p>
          <p className="mt-1 text-2xl font-bold">{suite._count.runs}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">Status</p>
          <p className="mt-1 text-2xl font-bold">{suite.archived ? 'Archived' : 'Active'}</p>
        </div>
      </div>

      {/* Test Cases Table */}
      <div className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-base font-semibold">Test Cases</h2>
        </div>
        {suite.testCases.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No test cases yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Add your first test case to define what to test.</p>
          </div>
        ) : (
          <div className="divide-y">
            <div className="grid grid-cols-[3rem_1fr_6rem_5rem_8rem] gap-2 px-6 py-2 text-xs font-medium text-muted-foreground">
              <span>#</span>
              <span>Title</span>
              <span>Target</span>
              <span>Priority</span>
              <span>Tags</span>
            </div>
            {suite.testCases.map((tc) => (
              <div
                key={tc.id}
                onClick={() => setEditingTestCaseId(tc.id)}
                className="grid grid-cols-[3rem_1fr_6rem_5rem_8rem] gap-2 px-6 py-3 text-sm hover:bg-muted/30 transition-colors items-center cursor-pointer"
              >
                <span className="text-xs text-muted-foreground">{tc.position + 1}</span>
                <span className="font-medium">{tc.title}</span>
                <Badge variant="secondary" className={`${TARGET_COLORS[tc.targetType]} text-[10px]`}>
                  {tc.targetType}
                </Badge>
                <Badge variant="secondary" className={`${PRIORITY_COLORS[tc.priority]} text-[10px]`}>
                  {tc.priority}
                </Badge>
                <div className="flex flex-wrap gap-1">
                  {tc.tags.map((tag: string) => (
                    <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Run Progress */}
      {activeRunId && (
        <div className="mt-6">
          <RunProgress runId={activeRunId} />
        </div>
      )}

      {/* Recent Runs */}
      <div className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-base font-semibold">Recent Runs</h2>
        </div>
        {!runHistory?.length ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            No runs yet.
          </div>
        ) : (
          <div className="divide-y">
            {runHistory.map((run) => (
              <Link
                key={run.id}
                href={`/${orgSlug}/${projectSlug}/runs/${run.id}`}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={STATUS_COLORS[run.status]}>
                    {run.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {run._count.testResults} result{run._count.testResults !== 1 ? 's' : ''}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(run.createdAt).toLocaleString()}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
      {/* Create test case dialog */}
      <CreateDialog
        trigger={<span className="hidden" />}
        title="Add test case"
        open={showCreateEditor}
        onOpenChange={setShowCreateEditor}
      >
        {({ close }) => (
          <TestCaseEditor orgSlug={orgSlug} suiteId={suite.id} close={close} />
        )}
      </CreateDialog>

      {/* Edit test case dialog */}
      <CreateDialog
        trigger={<span className="hidden" />}
        title="Edit test case"
        open={!!editingTestCaseId}
        onOpenChange={(open) => { if (!open) setEditingTestCaseId(null); }}
      >
        {({ close }) => (
          <TestCaseEditor
            orgSlug={orgSlug}
            suiteId={suite.id}
            testCaseId={editingTestCaseId!}
            close={() => { setEditingTestCaseId(null); close(); }}
          />
        )}
      </CreateDialog>
    </div>
  );
}
