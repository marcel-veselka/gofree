'use client';

import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Input } from '@/components/ui/input';

export function GenerateTestsForm({
  orgSlug,
  projectSlug,
}: {
  orgSlug: string;
  projectSlug: string;
}) {
  const utils = trpc.useUtils();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const generate = trpc.generate.fromUrl.useMutation({
    onSuccess: (data) => {
      setStatus('generating');
      setMessage(data.message);
      // Poll for completion by refetching suites after a delay
      setTimeout(() => {
        utils.testSuite.list.invalidate();
        setStatus('done');
        setMessage('Test suites generated successfully! Refresh to see them.');
        setUrl('');
        // Reset after a few seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      }, 15000);
    },
    onError: (err) => {
      setStatus('error');
      setMessage(err.message || 'Failed to generate tests');
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setStatus('generating');
    setMessage('Starting AI analysis...');
    generate.mutate({ orgSlug, projectSlug, url: url.trim() });
  }

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="text-sm font-semibold">Generate tests from URL</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Point AI at your application and it will generate test suites automatically
        </p>
      </div>
      <div className="px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-app.com"
            required
            disabled={status === 'generating'}
            className="flex-1"
          />
          <button
            type="submit"
            disabled={status === 'generating' || !url.trim()}
            className="whitespace-nowrap rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {status === 'generating' ? 'Generating...' : 'Generate Tests'}
          </button>
        </form>
        {message && (
          <div
            className={`mt-3 rounded-lg px-3 py-2 text-sm ${
              status === 'error'
                ? 'bg-red-50 text-red-700'
                : status === 'done'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-blue-50 text-blue-700'
            }`}
          >
            {status === 'generating' && (
              <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
