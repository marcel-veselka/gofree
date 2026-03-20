import { NextRequest, NextResponse } from 'next/server';
import { db } from '@gofree/db';
import { authenticateApiKey } from '../../../auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ suiteId: string }> },
) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { suiteId } = await params;

  // Load suite to get projectId
  const suite = await db.testSuite.findUnique({
    where: { id: suiteId },
    include: { project: true },
  });

  if (!suite) {
    return NextResponse.json({ error: 'Test suite not found' }, { status: 404 });
  }

  // Verify the suite's project belongs to the API key's org
  if (suite.project.orgId !== auth.orgId) {
    return NextResponse.json({ error: 'Test suite not found' }, { status: 404 });
  }

  // If API key is scoped to a project, enforce it
  if (auth.apiKey.projectId && auth.apiKey.projectId !== suite.projectId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: { environmentId?: string; agentDefinitionId?: string } = {};
  try {
    const text = await request.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Resolve environment — use provided, or project default
  let environmentId = body.environmentId;
  if (!environmentId) {
    const defaultEnv = await db.testEnvironment.findFirst({
      where: { projectId: suite.projectId, isDefault: true },
    });
    environmentId = defaultEnv?.id;
  }

  // Resolve agent definition — use provided, or latest in project
  let agentDefinitionId = body.agentDefinitionId;
  if (!agentDefinitionId) {
    const latestAgent = await db.agentDefinition.findFirst({
      where: { projectId: suite.projectId },
      orderBy: [{ version: 'desc' }],
    });
    agentDefinitionId = latestAgent?.id;
  }

  // Create Run record
  const run = await db.run.create({
    data: {
      projectId: suite.projectId,
      userId: 'api-key',
      type: 'TEST',
      status: 'PENDING',
      testSuiteId: suiteId,
      environmentId: environmentId ?? undefined,
      agentDefinitionId: agentDefinitionId ?? undefined,
    },
  });

  // Execute the run — fire and forget
  const { runTestSuite } = await import('@gofree/ai');
  runTestSuite({ runId: run.id }).catch((err) => {
    console.error(`[api/v1/suites/run] Run ${run.id} failed:`, err);
  });

  return NextResponse.json({ runId: run.id }, { status: 201 });
}
