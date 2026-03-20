import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs/promises';
import { getScreenshotPath } from '../../../../lib/screenshots';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const storagePath = segments.join('/');

  // Reject path traversal attempts
  if (storagePath.includes('..') || storagePath.includes('\0')) {
    return new NextResponse('Invalid path', { status: 400 });
  }

  const absolutePath = getScreenshotPath(storagePath);

  try {
    const data = await fs.readFile(absolutePath);
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
