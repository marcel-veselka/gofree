import { authHandler } from '@gofree/auth/handler';

export const runtime = 'nodejs';

export const GET = authHandler.GET;

export const POST: typeof authHandler.POST = async (req) => {
  try {
    return await authHandler.POST(req);
  } catch (err) {
    console.error('[auth] POST error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
