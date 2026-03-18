interface OrgPageProps {
  params: Promise<{ org: string }>;
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { org } = await params;
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Organization: {org}</h1>
      <p className="mt-2 text-muted-foreground">Organization dashboard coming soon.</p>
    </div>
  );
}
