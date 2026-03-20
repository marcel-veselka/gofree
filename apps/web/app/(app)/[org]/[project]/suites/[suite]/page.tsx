import { SuiteDetail } from './suite-detail';

interface SuitePageProps {
  params: Promise<{ org: string; project: string; suite: string }>;
}

export default async function SuitePage({ params }: SuitePageProps) {
  const { org, project, suite } = await params;
  return <SuiteDetail orgSlug={org} projectSlug={project} suiteSlug={suite} />;
}
