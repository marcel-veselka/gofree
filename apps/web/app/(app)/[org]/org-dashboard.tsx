'use client';

import { useState } from 'react';
import Link from 'next/link';
import { trpc } from '@/lib/trpc';
import { StatCard } from '@/components/stat-card';
import { CreateDialog } from '@/components/create-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const RUN_STATUS_STYLES: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  RUNNING: 'bg-blue-100 text-blue-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  MEMBER: 'bg-green-100 text-green-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

function CreateProjectForm({ orgSlug, close }: { orgSlug: string; close: () => void }) {
  const utils = trpc.useUtils();
  const createProject = trpc.project.create.useMutation({
    onSuccess: () => {
      utils.project.list.invalidate();
      close();
    },
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await createProject.mutateAsync({ orgSlug, name, description: description || undefined });
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create project');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="project-name">Project name</Label>
        <Input
          id="project-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My API Tests"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-desc">Description (optional)</Label>
        <Textarea
          id="project-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you testing?"
          rows={2}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={createProject.isPending}
        className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
      >
        {createProject.isPending ? 'Creating...' : 'Create project'}
      </button>
    </form>
  );
}

export function OrgDashboard({ orgSlug }: { orgSlug: string }) {
  const { data: org } = trpc.org.getBySlug.useQuery({ orgSlug });
  const { data: projects } = trpc.project.list.useQuery({ orgSlug });
  const { data: members, refetch: refetchMembers } = trpc.member.list.useQuery({ orgSlug });
  const { data: stats } = trpc.dashboard.stats.useQuery({ orgSlug });
  const { data: recentRuns } = trpc.dashboard.recentRuns.useQuery({ orgSlug });
  const addMember = trpc.member.add.useMutation({ onSuccess: () => refetchMembers() });
  const updateRole = trpc.member.updateRole.useMutation({ onSuccess: () => refetchMembers() });
  const removeMember = trpc.member.remove.useMutation({ onSuccess: () => refetchMembers() });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const isAdmin = org?.role === 'OWNER' || org?.role === 'ADMIN';
  const projectCount = projects?.length ?? 0;

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError('');
    try {
      await addMember.mutateAsync({ orgSlug, email: inviteEmail });
      setInviteEmail('');
    } catch (err: unknown) {
      setInviteError((err as Error).message || 'Failed to add member');
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold text-white">
            {(org?.name ?? orgSlug)[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{org?.name ?? orgSlug}</h1>
            {org?.role && (
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[org.role]}`}>
                {org.role}
              </span>
            )}
          </div>
        </div>
        <CreateDialog
          trigger={
            <button className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all">
              New project
            </button>
          }
          title="Create project"
        >
          {({ close }) => <CreateProjectForm orgSlug={orgSlug} close={close} />}
        </CreateDialog>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <StatCard label="Projects" value={stats?.projectCount ?? projectCount} />
        <StatCard label="Test suites" value={stats?.suiteCount ?? '—'} />
        <StatCard label="Test cases" value={stats?.caseCount ?? '—'} />
        <StatCard label="Pass rate" value={stats?.passRate != null ? `${stats.passRate}%` : '—'} />
      </div>

      {/* Projects */}
      <div className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Projects</h2>
          <span className="text-sm text-muted-foreground">{projectCount} project{projectCount !== 1 ? 's' : ''}</span>
        </div>

        {projectCount === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-muted-foreground">No projects yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first project to start testing.</p>
          </div>
        ) : (
          <div className="divide-y">
            {projects?.map((p) => (
              <Link
                key={p.id}
                href={`/${orgSlug}/${p.slug}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  {p.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      {recentRuns && recentRuns.length > 0 && (
        <div className="mt-6 rounded-xl border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-base font-semibold">Recent activity</h2>
            <span className="text-sm text-muted-foreground">Last {recentRuns.length} run{recentRuns.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="divide-y">
            {recentRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between px-6 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={RUN_STATUS_STYLES[run.status] ?? 'bg-gray-100 text-gray-800'}>
                    {run.status}
                  </Badge>
                  <span className="text-sm font-medium">{run.testSuite?.name ?? 'Unknown suite'}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{run._count.testResults} result{run._count.testResults !== 1 ? 's' : ''}</span>
                  <span>{new Date(run.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      <div className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Members</h2>
          <span className="text-sm text-muted-foreground">{members?.length ?? 0} member{members?.length !== 1 ? 's' : ''}</span>
        </div>

        {isAdmin && (
          <div className="border-b px-6 py-4">
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email address..."
                required
                className="flex-1"
              />
              <button
                type="submit"
                disabled={addMember.isPending}
                className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {addMember.isPending ? 'Inviting...' : 'Invite'}
              </button>
            </form>
            {inviteError && <p className="mt-2 text-sm text-destructive">{inviteError}</p>}
          </div>
        )}

        <div className="divide-y">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                {member.user.image ? (
                  <img src={member.user.image} alt="" className="h-9 w-9 rounded-full" />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 text-xs font-semibold text-white">
                    {member.user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={ROLE_COLORS[member.role]}>
                  {member.role}
                </Badge>
                {isAdmin && member.role !== 'OWNER' && (
                  <>
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRole.mutate({
                          orgSlug,
                          membershipId: member.id,
                          role: e.target.value as 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER',
                        })
                      }
                      className="rounded-lg border bg-background px-2 py-1 text-xs"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      onClick={() => {
                        if (!window.confirm(`Remove ${member.user.name} from this organization?`)) return;
                        removeMember.mutate({ orgSlug, membershipId: member.id });
                      }}
                      className="rounded-lg px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
