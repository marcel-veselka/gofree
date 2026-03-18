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
    <div className="p-8">
      <h1 className="text-2xl font-bold">{org?.name ?? orgSlug}</h1>
      {org?.role && (
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[org.role]}`}>
          {org.role}
        </span>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Members</h2>

        {isAdmin && (
          <form onSubmit={handleInvite} className="mt-4 flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Add member by email"
              required
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="submit"
              disabled={addMember.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {addMember.isPending ? 'Adding...' : 'Add'}
            </button>
          </form>
        )}
        {inviteError && <p className="mt-2 text-sm text-destructive">{inviteError}</p>}

        <div className="mt-4 divide-y rounded-md border">
          {members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                {member.user.image ? (
                  <img src={member.user.image} alt="" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {member.user.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[member.role]}`}>
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
                      className="rounded border bg-background px-2 py-1 text-xs"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="MEMBER">MEMBER</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      onClick={() => removeMember.mutate({ orgSlug, membershipId: member.id })}
                      className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10"
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {!members?.length && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No members found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
