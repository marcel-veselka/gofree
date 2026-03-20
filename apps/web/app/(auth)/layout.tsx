import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#fafafa] px-4">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-gradient-to-r from-violet-200/30 to-indigo-200/30 blur-[100px]" />
      </div>
      {/* Logo top-left */}
      <Link href="/" className="absolute left-6 top-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
          G
        </div>
        <span className="text-lg font-bold tracking-tight">GoFree</span>
      </Link>
      <div className="relative z-10">{children}</div>
    </main>
  );
}
