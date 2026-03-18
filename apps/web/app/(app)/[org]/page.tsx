import { OrgDashboard } from './org-dashboard';

interface OrgPageProps {
  params: Promise<{ org: string }>;
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { org } = await params;
  return <OrgDashboard orgSlug={org} />;
}
