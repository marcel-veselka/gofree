interface ProjectPageProps {
  params: Promise<{ org: string; project: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { org, project } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">
        {org} / {project}
      </h1>
      <p className="mt-2 text-muted-foreground">Project overview coming soon.</p>
    </div>
  );
}
