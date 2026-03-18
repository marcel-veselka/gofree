import { task } from '@trigger.dev/sdk/v3';
import { indexContent } from '@gofree/search';

export const indexContentTask = task({
  id: 'search.index-content',
  run: async (payload: {
    entityType: string;
    entityId: string;
    orgId: string;
    projectId: string;
    content: string;
  }) => {
    await indexContent(payload);
    return { indexed: true };
  },
});
