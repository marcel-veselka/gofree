import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a default org and project for development
  const org = await prisma.organization.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Organization',
      slug: 'default',
    },
  });

  await prisma.project.upsert({
    where: { orgId_slug: { orgId: org.id, slug: 'demo' } },
    update: {},
    create: {
      orgId: org.id,
      name: 'Demo Project',
      slug: 'demo',
      description: 'A demo project to get started with GoFree.',
    },
  });

  console.log('Seed completed: default org and demo project created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
