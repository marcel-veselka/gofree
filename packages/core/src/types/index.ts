// Organization roles
export type OrgRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

// Run states
export type RunStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

// Run types
export type RunType = 'CHAT' | 'AGENT' | 'TOOL';

// Message roles
export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';

// Spec statuses
export type SpecStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'ARCHIVED';

// SSE event types
export type SSEEventType = 'token' | 'tool_call' | 'tool_result' | 'status' | 'error' | 'done';

export interface SSEEvent {
  type: SSEEventType;
  [key: string]: unknown;
}

export interface TokenEvent extends SSEEvent {
  type: 'token';
  content: string;
}

export interface ToolCallEvent extends SSEEvent {
  type: 'tool_call';
  name: string;
  args: Record<string, unknown>;
}

export interface DoneEvent extends SSEEvent {
  type: 'done';
  usage?: { prompt: number; completion: number; total: number };
}

// Pagination
export interface CursorPagination {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}
