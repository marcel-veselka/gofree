'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StepEditor, type Step } from '@/components/step-editor';
import { AssertionEditor, type Assertion } from '@/components/assertion-editor';

const TARGET_TYPES = ['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM'] as const;
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

interface TestCaseEditorProps {
  orgSlug: string;
  suiteId: string;
  testCaseId?: string;
  close: () => void;
}

export function TestCaseEditor({ orgSlug, suiteId, testCaseId, close }: TestCaseEditorProps) {
  const utils = trpc.useUtils();

  const { data: existing, isLoading } = trpc.testCase.getById.useQuery(
    { orgSlug, id: testCaseId! },
    { enabled: !!testCaseId }
  );

  const [title, setTitle] = useState('');
  const [targetType, setTargetType] = useState<string>('WEB');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [assertions, setAssertions] = useState<Assertion[]>([]);
  const [error, setError] = useState('');

  // Populate form when editing an existing test case
  useEffect(() => {
    if (existing) {
      setTitle(existing.title);
      setTargetType(existing.targetType);
      setPriority(existing.priority);
      setTags(existing.tags?.join(', ') ?? '');
      setSteps((existing.steps as unknown as Step[]) ?? []);
      setAssertions((existing.expectedAssertions as unknown as Assertion[]) ?? []);
    }
  }, [existing]);

  const createCase = trpc.testCase.create.useMutation({
    onSuccess: () => {
      utils.testSuite.getBySlug.invalidate();
      close();
    },
  });

  const updateCase = trpc.testCase.update.useMutation({
    onSuccess: () => {
      utils.testSuite.getBySlug.invalidate();
      close();
    },
  });

  const isPending = createCase.isPending || updateCase.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const parsedTags = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    try {
      if (testCaseId) {
        await updateCase.mutateAsync({
          orgSlug,
          id: testCaseId,
          title,
          priority: priority as (typeof PRIORITIES)[number],
          tags: parsedTags,
          steps: steps.length > 0 ? steps : undefined,
          expectedAssertions: assertions.length > 0 ? assertions : undefined,
        });
      } else {
        await createCase.mutateAsync({
          orgSlug,
          suiteId,
          title,
          targetType: targetType as (typeof TARGET_TYPES)[number],
          priority: priority as (typeof PRIORITIES)[number],
          tags: parsedTags,
          steps: steps.length > 0 ? steps : undefined,
          expectedAssertions: assertions.length > 0 ? assertions : undefined,
        });
      }
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to save test case');
    }
  }

  if (testCaseId && isLoading) {
    return <div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
      {/* Basic info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tc-title">Title</Label>
          <Input
            id="tc-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Verify login button works"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Target type</Label>
            <Select value={targetType} onValueChange={(v) => v && setTargetType(v)} disabled={!!testCaseId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TARGET_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={(v) => v && setPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tc-tags">Tags (comma-separated)</Label>
          <Input
            id="tc-tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="smoke, auth, critical-path"
          />
        </div>
      </div>

      {/* Test Steps */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Test Steps</h3>
        <StepEditor steps={steps} onChange={setSteps} />
      </div>

      {/* Expected Assertions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Expected Assertions</h3>
        <AssertionEditor assertions={assertions} onChange={setAssertions} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
      >
        {isPending ? 'Saving...' : testCaseId ? 'Update test case' : 'Add test case'}
      </button>
    </form>
  );
}
