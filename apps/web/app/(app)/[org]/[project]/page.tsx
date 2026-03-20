import { ProjectDetail } from './project-detail';

interface ProjectPageProps {
  params: Promise<{ org: string; project: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { org, project } = await params;
  return <ProjectDetail orgSlug={org} projectSlug={project} />;
}
