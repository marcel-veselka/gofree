/**
 * Exposes the GoFree platform as an MCP server.
 * External AI clients can connect and use platform tools.
 */
export function createMcpServer() {
  // TODO: Implement MCP server using @modelcontextprotocol/sdk
  return {
    handle: async (_request: Request) => {
      return new Response('MCP server not yet implemented', { status: 501 });
    },
  };
}
