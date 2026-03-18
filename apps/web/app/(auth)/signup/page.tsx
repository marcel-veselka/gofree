'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@gofree/auth/client';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await authClient.signUp.email({ name, email, password });

    if (error) {
      setError(error.message ?? 'Registration failed');
      setLoading(false);
      return;
    }
    router.push('/');
  }

  async function handleGitHub() {
    await authClient.signIn.social({ provider: 'github', callbackURL: '/' });
  }

  return (
    <div className="w-full max-w-[400px]">
      {/* GitHub OAuth first */}
      <div className="space-y-3">
        <button
          onClick={handleGitHub}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold shadow-sm transition-all hover:border-foreground/20 hover:shadow-md"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          Sign up with GitHub
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-foreground/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#fafafa] px-3 text-foreground/40">or create with email</span>
        </div>
      </div>

      <div className="rounded-2xl border border-foreground/10 bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-foreground/50">Start building with AI agents in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-medium text-foreground/70">
              Full name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              placeholder="Marcel Veselka"
              className="w-full rounded-xl border border-foreground/10 bg-[#fafafa] px-4 py-3 text-sm transition-colors placeholder:text-foreground/30 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-medium text-foreground/70">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@company.com"
              className="w-full rounded-xl border border-foreground/10 bg-[#fafafa] px-4 py-3 text-sm transition-colors placeholder:text-foreground/30 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-medium text-foreground/70">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="8+ characters"
              className="w-full rounded-xl border border-foreground/10 bg-[#fafafa] px-4 py-3 text-sm transition-colors placeholder:text-foreground/30 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all hover:shadow-lg hover:shadow-violet-300 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create free account'}
          </button>

          <p className="text-center text-xs text-foreground/40">
            Free forever for individuals. No credit card needed.
          </p>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-foreground/50">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-violet-600 hover:text-violet-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
