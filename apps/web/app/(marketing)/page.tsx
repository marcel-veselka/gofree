import Link from 'next/link';
import { MobileNav } from '@/components/mobile-nav';
import { LandingNavAuth } from '@/components/landing-nav-auth';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#fafafa]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
              G
            </div>
            <span className="text-xl font-bold tracking-tight">GoFree</span>
          </div>
          <div className="hidden items-center gap-5 text-sm text-foreground/50 md:flex">
            <Link href="#what-we-test" className="transition-colors hover:text-foreground">What we test</Link>
            <Link href="#how-it-works" className="transition-colors hover:text-foreground">How it works</Link>
            <Link href="#deploy" className="transition-colors hover:text-foreground">Deploy</Link>
            <Link href="https://github.com/gofree-ai/gofree" className="transition-colors hover:text-foreground">Docs</Link>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <LandingNavAuth />
        </div>
        <MobileNav />
      </nav>

      {/* Hero */}
      <div className="relative flex flex-col items-center px-6 pb-16 pt-20 lg:pt-28">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[600px] rounded-full bg-gradient-to-r from-violet-200/40 to-indigo-200/40 blur-[120px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 py-2 text-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-foreground/60">AI Testing Agents &middot; Open source &middot; Self-hostable</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-7xl">
            Test{' '}
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              everything.
            </span>
            <br />
            Ship faster.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/60">
            Point AI agents at your app. Get comprehensive test coverage in minutes — no scripts to write.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl hover:shadow-violet-300"
            >
              Start testing for free
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </Link>
            <div className="flex items-center gap-4 text-sm text-foreground/40">
              <span>Free forever. No credit card.</span>
              <span>&middot;</span>
              <Link href="https://github.com/gofree-ai/gofree" className="inline-flex items-center gap-1 hover:text-foreground/60 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Star on GitHub
              </Link>
            </div>
          </div>
        </div>

        {/* Product preview mock */}
        <div className="relative z-10 mx-auto mt-16 max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-[#1e1e2e] shadow-2xl shadow-violet-200/30">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-2 text-xs text-white/40">GoFree — Test Run #42</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed">
              <p className="text-emerald-400">$ gofree test --url https://myapp.com</p>
              <p className="mt-2 text-white/60">Mapping application structure...</p>
              <p className="text-white/60">Found 23 pages, 8 API endpoints, 3 user flows</p>
              <p className="mt-2 text-white/60">Generating test plan...</p>
              <p className="text-violet-400">Created 47 test cases across 6 categories</p>
              <p className="mt-2 text-white/60">Running tests...</p>
              <p className="text-white/40">  [1/47] Homepage load ........................ <span className="text-emerald-400">PASS</span></p>
              <p className="text-white/40">  [2/47] Login flow ........................... <span className="text-emerald-400">PASS</span></p>
              <p className="text-white/40">  [3/47] Cart checkout ........................ <span className="text-emerald-400">PASS</span></p>
              <p className="text-white/40">  [4/47] API /users GET ....................... <span className="text-emerald-400">PASS</span></p>
              <p className="text-white/40">  [5/47] DB migration integrity ............... <span className="text-emerald-400">PASS</span></p>
              <p className="text-white/40">  [6/47] Mobile responsive nav ................ <span className="text-yellow-400">WARN</span></p>
              <p className="mt-2 text-white/60">...</p>
              <p className="mt-2 text-emerald-400">Done! 45 passed, 1 warning, 1 skipped. Coverage: 87%</p>
            </div>
          </div>
        </div>
      </div>

      {/* What we test — 6-card grid */}
      <section id="what-we-test" className="px-6 pb-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
              </div>
              <h3 className="text-base font-semibold">Web application testing</h3>
              <p className="mt-1 text-sm text-foreground/50">Autonomous browser testing with Playwright. Agents map your app, create tests, and self-heal when UI changes.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>
              </div>
              <h3 className="text-base font-semibold">Mobile app testing</h3>
              <p className="mt-1 text-sm text-foreground/50">Test iOS and Android apps through native frameworks. Agents handle device fragmentation and OS variations.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" /></svg>
              </div>
              <h3 className="text-base font-semibold">Desktop app testing</h3>
              <p className="mt-1 text-sm text-foreground/50">Windows, macOS, Linux. Agents interact with native UI elements, keyboard shortcuts, and system dialogs.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" /></svg>
              </div>
              <h3 className="text-base font-semibold">API &amp; integration testing</h3>
              <p className="mt-1 text-sm text-foreground/50">REST, GraphQL, gRPC, WebSocket. Agents generate test suites from your OpenAPI specs or by exploring endpoints.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" /></svg>
              </div>
              <h3 className="text-base font-semibold">Database &amp; data testing</h3>
              <p className="mt-1 text-sm text-foreground/50">Validate schemas, migrations, data integrity, and query performance. PostgreSQL, MySQL, MongoDB, and more.</p>
            </div>
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
              </div>
              <h3 className="text-base font-semibold">End-to-end flow testing</h3>
              <p className="mt-1 text-sm text-foreground/50">Test complete business workflows that span UI, APIs, databases, and third-party services in a single agent run.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-foreground/5 px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">From URL to test coverage in 3 steps</h2>
          <p className="mx-auto mt-4 max-w-lg text-center text-foreground/50">No test scripts to write. No specialized expertise needed. Just results.</p>
          <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl font-bold text-violet-600">1</div>
              <h3 className="mt-4 text-lg font-semibold">Point agents at your app</h3>
              <p className="mt-2 text-sm text-foreground/50">Give us a URL, API spec, or describe what to test. Agents crawl, understand structure, and identify critical paths.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-600">2</div>
              <h3 className="mt-4 text-lg font-semibold">Agents generate &amp; run tests</h3>
              <p className="mt-2 text-sm text-foreground/50">AI agents create test plans, write Playwright/API tests, execute them, and stream results in real time. No babysitting.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl font-bold text-emerald-600">3</div>
              <h3 className="mt-4 text-lg font-semibold">Ship with confidence</h3>
              <p className="mt-2 text-sm text-foreground/50">Get detailed reports, visual diffs, and regression results. Tests self-heal on every release. Full CI/CD integration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Deploy on your terms */}
      <section id="deploy" className="border-t border-foreground/5 bg-white px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">Deploy on your terms</h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border bg-[#fafafa] p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" /></svg>
              </div>
              <h3 className="text-xl font-semibold">Cloud (fully managed)</h3>
              <p className="mt-2 text-sm text-foreground/50">Focus on shipping. We host, scale, and update everything. Run tests on our infrastructure with zero setup.</p>
              <Link href="/signup" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700">
                Start free trial <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="rounded-2xl border bg-[#fafafa] p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z" /></svg>
              </div>
              <h3 className="text-xl font-semibold">Self-hosted (Docker)</h3>
              <p className="mt-2 text-sm text-foreground/50">Run inside your own CI/CD. Full control over security, data, and compliance. One-command Docker deploy.</p>
              <Link href="https://github.com/gofree-ai/gofree" className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                View docs <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 px-6 py-24 lg:px-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to test everything?</h2>
          <p className="mt-4 text-foreground/50">AI testing agents for web, mobile, desktop, APIs, and databases. Free forever for individuals.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-violet-200 transition-all hover:shadow-xl hover:shadow-violet-300"
            >
              Start testing for free
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
          <p className="mt-3 text-sm text-foreground/30">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 bg-white px-6 py-12 lg:px-12">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 sm:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white">G</div>
              <span className="font-semibold">GoFree</span>
            </div>
            <p className="mt-3 text-xs text-foreground/40">AI testing agents for everything.</p>
            <p className="mt-1 text-xs text-foreground/30">By the makers of <Link href="https://wopee.io" className="hover:text-foreground/50">Wopee.io</Link></p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Product</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/50">
              <Link href="#features" className="hover:text-foreground">Features</Link>
              <Link href="#how-it-works" className="hover:text-foreground">How it works</Link>
              <Link href="/signup" className="hover:text-foreground">Start free trial</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Resources</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/50">
              <Link href="https://github.com/gofree-ai/gofree" className="hover:text-foreground">GitHub</Link>
              <Link href="https://github.com/gofree-ai/gofree" className="hover:text-foreground">Documentation</Link>
              <Link href="https://wopee.io" className="hover:text-foreground">Wopee.io</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40">Legal</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-foreground/50">
              <Link href="#" className="hover:text-foreground">Terms of Service</Link>
              <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-5xl border-t border-foreground/5 pt-6 text-center text-xs text-foreground/30">
          Built by the <Link href="https://wopee.io" className="hover:text-foreground/50">Wopee.io</Link> team
        </div>
      </footer>
    </main>
  );
}
