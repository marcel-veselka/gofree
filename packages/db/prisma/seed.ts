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

  const project = await prisma.project.upsert({
    where: { orgId_slug: { orgId: org.id, slug: 'demo' } },
    update: {},
    create: {
      orgId: org.id,
      name: 'Demo Project',
      slug: 'demo',
      description: 'A demo project to get started with GoFree.',
    },
  });

  // ── Testing domain seed data ──────────────────────────────

  const suite = await prisma.testSuite.upsert({
    where: { projectId_slug: { projectId: project.id, slug: 'login-flow' } },
    update: {},
    create: {
      projectId: project.id,
      name: 'Login Flow Tests',
      slug: 'login-flow',
      description: 'End-to-end tests for the login flow across platforms.',
      targetType: 'WEB',
      config: { schedule: '0 */6 * * *', parallelism: 2 },
    },
  });

  // Web test case
  await prisma.testCase.upsert({
    where: { id: 'seed-tc-web-login' },
    update: {},
    create: {
      id: 'seed-tc-web-login',
      suiteId: suite.id,
      title: 'User can log in via email/password',
      targetType: 'WEB',
      priority: 'HIGH',
      position: 0,
      steps: [
        { type: 'navigate', params: { url: '/login' } },
        { type: 'fill', params: { selector: '[name=email]', value: 'test@example.com' } },
        { type: 'fill', params: { selector: '[name=password]', value: 'password' } },
        { type: 'click', params: { selector: 'button[type=submit]' } },
      ],
      expectedAssertions: [
        { type: 'visible', target: '[data-testid=dashboard]', expected: true },
        { type: 'contains', target: 'h1', expected: 'Welcome' },
      ],
      tags: ['smoke', 'auth'],
    },
  });

  // API test case
  await prisma.testCase.upsert({
    where: { id: 'seed-tc-api-health' },
    update: {},
    create: {
      id: 'seed-tc-api-health',
      suiteId: suite.id,
      title: 'Health endpoint returns 200',
      targetType: 'API',
      priority: 'CRITICAL',
      position: 1,
      steps: [
        { type: 'api-call', params: { method: 'GET', path: '/api/health' } },
      ],
      expectedAssertions: [
        { type: 'status-code', expected: 200 },
        { type: 'json-path', target: '$.status', expected: 'ok' },
      ],
      tags: ['smoke', 'api'],
    },
  });

  // DB test case
  await prisma.testCase.upsert({
    where: { id: 'seed-tc-db-users' },
    update: {},
    create: {
      id: 'seed-tc-db-users',
      suiteId: suite.id,
      title: 'Users table has at least one row',
      targetType: 'DATABASE',
      priority: 'MEDIUM',
      position: 2,
      steps: [
        { type: 'db-query', params: { query: 'SELECT count(*) as cnt FROM users' } },
      ],
      expectedAssertions: [
        { type: 'row-count', expected: 1, description: 'At least one user exists' },
      ],
      targetConfig: { dialect: 'postgresql' },
      tags: ['db', 'sanity'],
    },
  });

  // Test environment
  await prisma.testEnvironment.upsert({
    where: { projectId_slug: { projectId: project.id, slug: 'local-dev' } },
    update: {},
    create: {
      projectId: project.id,
      name: 'Local Development',
      slug: 'local-dev',
      targetType: 'WEB',
      config: {
        baseUrl: 'http://localhost:3000',
        browser: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
      isDefault: true,
    },
  });

  // Agent definition
  await prisma.agentDefinition.upsert({
    where: {
      projectId_slug_version: { projectId: project.id, slug: 'functional-tester', version: 1 },
    },
    update: {},
    create: {
      projectId: project.id,
      name: 'Functional Tester',
      slug: 'functional-tester',
      promptTemplate: 'You are an AI testing agent. Execute the test case "{{testCase.title}}" on {{environment.baseUrl}}. Follow the steps exactly, capture screenshots on failure, and report pass/fail for each assertion.',
      tools: ['browser-navigate', 'browser-click', 'browser-fill', 'browser-screenshot', 'assert-visible', 'assert-text', 'api-call'],
      model: 'claude-sonnet-4-20250514',
      supportedTargets: ['WEB', 'API'],
      defaultConfig: { maxSteps: 50, timeoutMs: 300000, screenshotOnFailure: true },
    },
  });

  console.log('Seed completed: org, project, test suite, cases, environment, and agent definition created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
