'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { trpc } from '@/lib/trpc';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ProjectItem({
  project,
  orgSlug,
  isActive,
}: {
  project: { name: string; slug: string };
  orgSlug: string;
  isActive: boolean;
}) {
  const [expanded, setExpanded] = useState(isActive);
  const pathname = usePathname();

  const basePath = `/${orgSlug}/${project.slug}`;
  const isOnProject = pathname.startsWith(basePath);

  // Auto-expand when navigating into this project
  if (isOnProject && !expanded) setExpanded(true);

  const subItems = [
    { label: 'Test Suites', href: `${basePath}?tab=suites` },
    { label: 'Environments', href: `${basePath}?tab=environments` },
    { label: 'Agents', href: `${basePath}?tab=agents` },
  ];

  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-muted/60"
        >
          <ChevronIcon open={expanded} />
        </button>
        <Link
          href={basePath}
          className={`flex-1 rounded-md px-2 py-1.5 text-sm transition-colors ${
            isOnProject
              ? 'bg-muted font-medium text-foreground'
              : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
          }`}
        >
          {project.name}
        </Link>
      </div>
      {expanded && (
        <div className="ml-7 mt-0.5 space-y-0.5">
          {subItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarNav() {
  const params = useParams<{ org?: string; project?: string }>();
  const orgSlug = params.org;

  const { data: projects } = trpc.project.list.useQuery(
    { orgSlug: orgSlug! },
    { enabled: !!orgSlug }
  );

  if (!orgSlug) return null;

  return (
    <div className="space-y-1">
      <Link
        href={`/${orgSlug}`}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </Link>

      <div className="pt-2">
        <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Projects
        </p>
        {projects?.length === 0 && (
          <p className="px-2 py-2 text-xs text-muted-foreground">
            No projects yet.{' '}
            <Link href={`/${orgSlug}`} className="text-violet-500 hover:underline">
              Create one
            </Link>
          </p>
        )}
        {projects?.map((p) => (
          <ProjectItem
            key={p.id}
            project={p}
            orgSlug={orgSlug}
            isActive={params.project === p.slug}
          />
        ))}
      </div>
    </div>
  );
}
