interface WorkspacePageProps {
  params: Promise<{ org: string; project: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { org, project } = await params;
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold">
          {org} / {project}
        </h1>
        <p className="mt-2 text-muted-foreground">Workspace environment coming soon.</p>
      </div>
    </div>
  );
}
