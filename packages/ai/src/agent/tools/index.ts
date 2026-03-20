import type { CoreTool } from 'ai';

import { apiCall } from './api-call';
import { assertContains } from './assert-contains';
import { assertJsonPath } from './assert-json-path';
import { assertStatusCode } from './assert-status-code';
import {
  browserClick,
  browserFill,
  browserNavigate,
  browserScreenshot,
} from './browser-simulate';
import { createBrowserTools } from './browser-real';
import { dbQuery } from './db-query';
import { reportResult } from './report-result';

export { BrowserContext } from './browser-context';
export { createBrowserTools } from './browser-real';

const assertTools: Record<string, CoreTool> = {
  assertStatusCode,
  assertJsonPath,
  assertContains,
};

const simulatedBrowserTools: Record<string, CoreTool> = {
  browserNavigate,
  browserClick,
  browserFill,
  browserScreenshot,
};

interface GetToolsOptions {
  /** Pass a BrowserContext to use real Playwright tools instead of simulated ones */
  browserContext?: InstanceType<typeof import('./browser-context').BrowserContext>;
}

export function getToolsForTarget(
  targetType: string,
  options?: GetToolsOptions
): Record<string, CoreTool> {
  const browserTools = options?.browserContext
    ? createBrowserTools(options.browserContext)
    : simulatedBrowserTools;

  switch (targetType) {
    case 'WEB':
      return {
        ...browserTools,
        ...assertTools,
        reportResult,
      };
    case 'API':
      return {
        apiCall,
        ...assertTools,
        reportResult,
      };
    case 'DATABASE':
      return {
        dbQuery,
        ...assertTools,
        reportResult,
      };
    case 'CROSS_PLATFORM':
      return {
        apiCall,
        ...browserTools,
        ...assertTools,
        dbQuery,
        reportResult,
      };
    default:
      return {
        ...assertTools,
        ...browserTools,
        reportResult,
      };
  }
}

export function getAllTools(): Record<string, CoreTool> {
  return {
    apiCall,
    ...assertTools,
    ...simulatedBrowserTools,
    dbQuery,
    reportResult,
  };
}
