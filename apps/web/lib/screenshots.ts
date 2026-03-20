import fs from 'node:fs/promises';
import path from 'node:path';

/**
 * Base directory for screenshot storage.
 * Uses `data/screenshots/` relative to the project root (apps/web).
 */
const SCREENSHOTS_BASE = path.join(process.cwd(), 'data', 'screenshots');

/**
 * Save a screenshot buffer to disk.
 *
 * @param runId  - The test run ID (used as subdirectory)
 * @param name   - Screenshot name (used as filename, `.png` appended if missing)
 * @param buffer - Raw PNG image data
 * @returns The relative storage path (e.g. `{runId}/{name}.png`)
 */
export async function saveScreenshot(
  runId: string,
  name: string,
  buffer: Buffer,
): Promise<string> {
  const filename = name.endsWith('.png') ? name : `${name}.png`;
  const dir = path.join(SCREENSHOTS_BASE, runId);
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, buffer);

  // Return the relative storage path used for retrieval
  return `${runId}/${filename}`;
}

/**
 * Resolve a relative storage path to an absolute filesystem path.
 *
 * @param storagePath - Relative path as returned by `saveScreenshot`
 * @returns Absolute filesystem path
 */
export function getScreenshotPath(storagePath: string): string {
  return path.join(SCREENSHOTS_BASE, storagePath);
}
