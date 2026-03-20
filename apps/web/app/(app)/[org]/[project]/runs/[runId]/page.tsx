import { RunDetail } from './run-detail';

interface RunPageProps {
  params: Promise<{ org: string; project: string; runId: string }>;
}

export default async function RunPage({ params }: RunPageProps) {
  const { org, project, runId } = await params;
  return <RunDetail orgSlug={org} projectSlug={project} runId={runId} />;
}
