import { db } from '@gofree/db';

interface IndexContentOptions {
  entityType: string;
  entityId: string;
  orgId: string;
  projectId: string;
  content: string;
}

export async function indexContent(options: IndexContentOptions) {
  await db.searchIndex.upsert({
    where: {
      entityType_entityId: {
        entityType: options.entityType,
        entityId: options.entityId,
      },
    },
    update: {
      content: options.content,
    },
    create: {
      entityType: options.entityType,
      entityId: options.entityId,
      orgId: options.orgId,
      projectId: options.projectId,
      content: options.content,
    },
  });

  // TODO: Update tsvector and embedding columns via raw SQL
}
