export const APP_NAME = 'GoFree';

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export const MAX_FILE_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB

export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

export const ORG_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;

export const RUN_STATUSES = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const;

export const SPEC_STATUSES = ['DRAFT', 'REVIEW', 'APPROVED', 'ARCHIVED'] as const;
