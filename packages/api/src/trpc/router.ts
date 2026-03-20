import { t } from './procedures';
import { orgRouter } from './routers/org';
import { projectRouter } from './routers/project';
import { memberRouter } from './routers/member';
import { testSuiteRouter } from './routers/test-suites';
import { testCaseRouter } from './routers/test-cases';
import { testEnvironmentRouter } from './routers/test-environments';
import { agentDefinitionRouter } from './routers/agent-definitions';
import { testResultRouter } from './routers/test-results';
import { runRouter } from './routers/run';
import { dashboardRouter } from './routers/dashboard';

export { publicProcedure, protectedProcedure, orgProcedure } from './procedures';

export const appRouter = t.router({
  org: orgRouter,
  project: projectRouter,
  member: memberRouter,
  testSuite: testSuiteRouter,
  testCase: testCaseRouter,
  testEnvironment: testEnvironmentRouter,
  agentDefinition: agentDefinitionRouter,
  testResult: testResultRouter,
  run: runRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
