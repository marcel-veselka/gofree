'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { CreateDialog } from '@/components/create-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TARGET_TYPES = ['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM'] as const;
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

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

function CreateTestCaseForm({
  orgSlug,
  suiteId,
  close,
}: {
  orgSlug: string;
  suiteId: string;
  close: () => void;
}) {
  const utils = trpc.useUtils();
  const createCase = trpc.testCase.create.useMutation({
    onSuccess: () => {
      utils.testSuite.getBySlug.invalidate();
      close();
    },
  });

  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<string>('WEB');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createCase.mutateAsync({
        orgSlug,
        suiteId,
        title,
        targetType: targetType as typeof TARGET_TYPES[number],
        priority: priority as typeof PRIORITIES[number],
        tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      });
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create test case');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="case-title">Title</Label>
        <Input
          id="case-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Verify login button works"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Target type</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TARGET_TYPES.map((t) => (
                <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="case-tags">Tags (comma-separated)</Label>
        <Input
          id="case-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="smoke, auth, critical-path"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={createCase.isPending}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
      >
        {createCase.isPending ? 'Adding...' : 'Add test case'}
      </button>
    </form>
  );
}

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

  const utils = trpc.useUtils();
  const archiveSuite = trpc.testSuite.archive.useMutation({
    onSuccess: () => utils.testSuite.getBySlug.invalidate(),
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
          <CreateDialog
            trigger={
              <button className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
                Add test case
              </button>
            }
            title="Add test case"
          >
            {({ close }) => (
              <CreateTestCaseForm orgSlug={orgSlug} suiteId={suite.id} close={close} />
            )}
          </CreateDialog>
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
                className="grid grid-cols-[3rem_1fr_6rem_5rem_8rem] gap-2 px-6 py-3 text-sm hover:bg-muted/30 transition-colors items-center"
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
              <div key={run.id} className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
