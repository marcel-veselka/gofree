import { NextRequest, NextResponse } from 'next/server';
import { db } from '@gofree/db';
import { authenticateApiKey } from '../auth';

export async function GET(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projectId = request.nextUrl.searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json(
      { error: 'Missing required query parameter: projectId' },
      { status: 400 },
    );
  }

  // Verify the project belongs to the API key's org
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, orgId: true },
  });

  if (!project || project.orgId !== auth.orgId) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  // If API key is scoped to a project, enforce it
  if (auth.apiKey.projectId && auth.apiKey.projectId !== projectId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const suites = await db.testSuite.findMany({
    where: { projectId, archived: false },
    include: { _count: { select: { testCases: true, runs: true } } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ suites });
}
