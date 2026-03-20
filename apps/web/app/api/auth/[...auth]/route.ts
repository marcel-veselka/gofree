import { authHandler } from '@gofree/auth/handler';

export const runtime = 'nodejs';

// Wrap both handlers to catch and log any errors
async function handleRequest(handler: Function, req: Request): Promise<Response> {
  try {
    const response = await handler(req);
    console.log(`[auth] ${req.method} ${new URL(req.url).pathname} -> ${response.status}`);
    return response;
  } catch (err) {
    console.error('[auth] Unhandled error:', err);
    return new Response(JSON.stringify({ error: String(err), stack: (err as Error)?.stack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const GET = (req: Request) => handleRequest(authHandler.GET, req);
export const POST = (req: Request) => handleRequest(authHandler.POST, req);
