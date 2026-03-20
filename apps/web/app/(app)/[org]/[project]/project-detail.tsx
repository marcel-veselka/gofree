'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';
import { CreateDialog } from '@/components/create-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TARGET_TYPES = ['WEB', 'MOBILE', 'DESKTOP', 'API', 'DATABASE', 'CROSS_PLATFORM'] as const;

const TARGET_COLORS: Record<string, string> = {
  WEB: 'bg-blue-100 text-blue-800',
  MOBILE: 'bg-green-100 text-green-800',
  DESKTOP: 'bg-purple-100 text-purple-800',
  API: 'bg-orange-100 text-orange-800',
  DATABASE: 'bg-red-100 text-red-800',
  CROSS_PLATFORM: 'bg-pink-100 text-pink-800',
};

function CreateSuiteForm({
  orgSlug,
  projectSlug,
  close,
}: {
  orgSlug: string;
  projectSlug: string;
  close: () => void;
}) {
  const utils = trpc.useUtils();
  const createSuite = trpc.testSuite.create.useMutation({
    onSuccess: () => {
      utils.testSuite.list.invalidate();
      close();
    },
  });

  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<string>('WEB');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createSuite.mutateAsync({
        orgSlug,
        projectSlug,
        name,
        targetType: targetType as typeof TARGET_TYPES[number],
        description: description || undefined,
      });
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create test suite');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="suite-name">Suite name</Label>
        <Input
          id="suite-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Login Flow Tests"
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Target type</Label>
        <Select value={targetType} onValueChange={setTargetType}>
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
        <Label htmlFor="suite-desc">Description (optional)</Label>
        <Textarea
          id="suite-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this test suite cover?"
          rows={2}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={createSuite.isPending}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
      >
        {createSuite.isPending ? 'Creating...' : 'Create test suite'}
      </button>
    </form>
  );
}

export function ProjectDetail({
  orgSlug,
  projectSlug,
}: {
  orgSlug: string;
  projectSlug: string;
}) {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') ?? 'suites';

  const { data: project } = trpc.project.getBySlug.useQuery({ orgSlug, slug: projectSlug });
  const { data: suites } = trpc.testSuite.list.useQuery({ orgSlug, projectSlug });
  const { data: environments } = trpc.testEnvironment.list.useQuery({ orgSlug, projectSlug });
  const { data: agents } = trpc.agentDefinition.list.useQuery({ orgSlug, projectSlug });

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project?.name ?? projectSlug}</h1>
          {project?.description && (
            <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} className="mt-6">
        <TabsList>
          <TabsTrigger value="suites" asChild>
            <Link href={`/${orgSlug}/${projectSlug}?tab=suites`}>
              Test Suites ({suites?.length ?? 0})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="environments" asChild>
            <Link href={`/${orgSlug}/${projectSlug}?tab=environments`}>
              Environments ({environments?.length ?? 0})
            </Link>
          </TabsTrigger>
          <TabsTrigger value="agents" asChild>
            <Link href={`/${orgSlug}/${projectSlug}?tab=agents`}>
              Agents ({agents?.length ?? 0})
            </Link>
          </TabsTrigger>
        </TabsList>

        {/* Test Suites Tab */}
        <TabsContent value="suites" className="mt-4">
          <div className="flex justify-end mb-4">
            <CreateDialog
              trigger={
                <button className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
                  New test suite
                </button>
              }
              title="Create test suite"
            >
              {({ close }) => (
                <CreateSuiteForm orgSlug={orgSlug} projectSlug={projectSlug} close={close} />
              )}
            </CreateDialog>
          </div>

          {suites?.length === 0 ? (
            <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No test suites yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">Create your first test suite to start organizing tests.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {suites?.map((suite) => (
                <Link
                  key={suite.id}
                  href={`/${orgSlug}/${projectSlug}/suites/${suite.slug}`}
                  className="flex items-center justify-between rounded-xl border bg-card px-6 py-4 shadow-sm hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">{suite.name}</p>
                      {suite.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{suite.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={TARGET_COLORS[suite.targetType]}>
                      {suite.targetType}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {suite._count.testCases} case{suite._count.testCases !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {suite._count.runs} run{suite._count.runs !== 1 ? 's' : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Environments Tab */}
        <TabsContent value="environments" className="mt-4">
          {environments?.length === 0 ? (
            <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No environments configured.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {environments?.map((env) => (
                <div
                  key={env.id}
                  className="flex items-center justify-between rounded-xl border bg-card px-6 py-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{env.name}</p>
                      {env.isDefault && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-[10px]">
                          DEFAULT
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className={TARGET_COLORS[env.targetType]}>
                    {env.targetType}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="mt-4">
          {agents?.length === 0 ? (
            <div className="rounded-xl border bg-card px-6 py-12 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">No agent definitions yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {agents?.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between rounded-xl border bg-card px-6 py-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium">{agent.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      v{agent.version} · {agent.model} · {agent._count.runs} run{agent._count.runs !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {agent.supportedTargets.map((t: string) => (
                      <Badge key={t} variant="secondary" className={`${TARGET_COLORS[t]} text-[10px]`}>
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
