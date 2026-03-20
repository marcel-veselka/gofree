'use client';

interface Screenshot {
  name: string;
  storagePath: string;
}

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
}

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  if (screenshots.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">Screenshots</h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {screenshots.map((s) => (
          <a
            key={s.storagePath}
            href={`/api/screenshots/${s.storagePath}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-md border bg-muted"
          >
            <img
              src={`/api/screenshots/${s.storagePath}`}
              alt={s.name}
              className="aspect-video w-full object-cover transition-opacity group-hover:opacity-80"
              loading="lazy"
            />
            <span className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-2 py-1 text-xs text-white">
              {s.name}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
