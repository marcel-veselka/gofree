import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@gofree/api';

export const trpc = createTRPCReact<AppRouter>();
