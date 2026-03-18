import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b px-6 py-4">
        <span className="text-xl font-bold tracking-tight">GoFree</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-md px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
            Open source &middot; Self-hostable &middot; AI-native
          </div>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Build with
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {' '}AI agents
            </span>
            ,{' '}not just prompts
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            GoFree is the platform for specs, agent runs, and real-time collaboration.
            Define what you want. Let agents build it. Ship faster.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-foreground px-6 py-3 text-sm font-semibold text-background shadow-sm hover:opacity-90"
            >
              Start for free
            </Link>
            <Link
              href="https://github.com"
              className="flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold text-foreground shadow-sm hover:bg-accent"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View on GitHub
            </Link>
          </div>
        </div>

        {/* Feature grid */}
        <div className="mx-auto mt-24 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>
            </div>
            <h3 className="font-semibold">Spec-driven</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Define requirements as specs. AI agents implement them. Every change is traceable.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
            </div>
            <h3 className="font-semibold">AI agents</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Long-running agents with tool access, MCP connectivity, and durable execution.
            </p>
          </div>
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" /></svg>
            </div>
            <h3 className="font-semibold">Self-hostable</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Run on your own infrastructure with Docker. Your data stays yours.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        GoFree &mdash; Open source AI-native platform
      </footer>
    </main>
  );
}
