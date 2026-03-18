/**
 * Manages connections to external MCP servers.
 * Each project can register multiple MCP servers.
 */
export class McpClientManager {
  private connections = new Map<string, unknown>();

  async connect(id: string, serverUrl: string, _transport: 'sse' | 'stdio' = 'sse') {
    // TODO: Implement MCP client connection using @modelcontextprotocol/sdk
    this.connections.set(id, { serverUrl, status: 'connected' });
  }

  async disconnect(id: string) {
    this.connections.delete(id);
  }

  async listTools(id: string) {
    const _conn = this.connections.get(id);
    // TODO: List tools from connected MCP server
    return [];
  }

  async executeTool(id: string, _toolName: string, _args: Record<string, unknown>) {
    const _conn = this.connections.get(id);
    // TODO: Execute tool on connected MCP server
    return {};
  }
}
