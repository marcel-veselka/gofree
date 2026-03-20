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
import { dbQuery } from './db-query';
import { reportResult } from './report-result';

const assertTools: Record<string, CoreTool> = {
  assertStatusCode,
  assertJsonPath,
  assertContains,
};

const browserTools: Record<string, CoreTool> = {
  browserNavigate,
  browserClick,
  browserFill,
  browserScreenshot,
};

const allTools: Record<string, CoreTool> = {
  apiCall,
  ...assertTools,
  ...browserTools,
  dbQuery,
  reportResult,
};

export function getToolsForTarget(
  targetType: string
): Record<string, CoreTool> {
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
      return { ...allTools };
    default:
      // MOBILE, DESKTOP, and any other target type
      return {
        ...assertTools,
        ...browserTools,
        reportResult,
      };
  }
}

export function getAllTools(): Record<string, CoreTool> {
  return { ...allTools };
}
