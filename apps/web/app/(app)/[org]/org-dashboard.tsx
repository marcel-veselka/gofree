'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';

const ROLE_COLORS: Record<string, string> = {
  OWNER: 'bg-amber-100 text-amber-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  MEMBER: 'bg-green-100 text-green-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

export function OrgDashboard({ orgSlug }: { orgSlug: string }) {
  const { data: org } = trpc.org.getBySlug.useQuery({ orgSlug });
  const { data: members, refetch: refetchMembers } = trpc.member.list.useQuery({ orgSlug });
  const addMember = trpc.member.add.useMutation({ onSuccess: () => refetchMembers() });
  const updateRole = trpc.member.updateRole.useMutation({ onSuccess: () => refetchMembers() });
  const removeMember = trpc.member.remove.useMutation({ onSuccess: () => refetchMembers() });

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');

  const isAdmin = org?.role === 'OWNER' || org?.role === 'ADMIN';

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
    <div className="mx-auto max-w-3xl">
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

      <div className="mt-8 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-base font-semibold">Members</h2>
          <span className="text-sm text-muted-foreground">{members?.length ?? 0} member{members?.length !== 1 ? 's' : ''}</span>
        </div>

        {isAdmin && (
          <div className="border-b px-6 py-4">
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Invite by email address..."
                required
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                  {member.role}
                </span>
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
                      onClick={() => removeMember.mutate({ orgSlug, membershipId: member.id })}
                      className="rounded-lg px-2.5 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!members?.length && (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">No members yet. Invite someone above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
