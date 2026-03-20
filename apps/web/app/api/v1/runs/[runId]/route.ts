import { NextRequest, NextResponse } from 'next/server';
import { db } from '@gofree/db';
import { authenticateApiKey } from '../../auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> },
) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { runId } = await params;

  const run = await db.run.findUnique({
    where: { id: runId },
    include: {
      testSuite: { select: { name: true, slug: true } },
      testResults: {
        include: {
          testCase: { select: { id: true, title: true, targetType: true, priority: true } },
          assertions: true,
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!run) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  // Verify the run belongs to the API key's org
  const project = await db.project.findUnique({
    where: { id: run.projectId },
    select: { orgId: true },
  });

  if (!project || project.orgId !== auth.orgId) {
    return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  }

  // If API key is scoped to a project, enforce it
  if (auth.apiKey.projectId && auth.apiKey.projectId !== run.projectId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ run });
}
