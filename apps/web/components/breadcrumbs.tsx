'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc';

export function Breadcrumbs() {
  const params = useParams<{ org?: string; project?: string; suite?: string }>();

  const orgSlug = params.org;
  const projectSlug = params.project;
  const suiteSlug = params.suite;

  const { data: org } = trpc.org.getBySlug.useQuery(
    { orgSlug: orgSlug! },
    { enabled: !!orgSlug }
  );
  const { data: project } = trpc.project.getBySlug.useQuery(
    { orgSlug: orgSlug!, slug: projectSlug! },
    { enabled: !!orgSlug && !!projectSlug }
  );
  const { data: suite } = trpc.testSuite.getBySlug.useQuery(
    { orgSlug: orgSlug!, projectSlug: projectSlug!, suiteSlug: suiteSlug! },
    { enabled: !!orgSlug && !!projectSlug && !!suiteSlug }
  );

  if (!orgSlug) return null;

  const crumbs: { label: string; href: string }[] = [
    { label: org?.name ?? orgSlug, href: `/${orgSlug}` },
  ];

  if (projectSlug) {
    crumbs.push({ label: project?.name ?? projectSlug, href: `/${orgSlug}/${projectSlug}` });
  }

  if (suiteSlug) {
    crumbs.push({
      label: suite?.name ?? suiteSlug,
      href: `/${orgSlug}/${projectSlug}/suites/${suiteSlug}`,
    });
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted-foreground/40">/</span>}
          {i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
