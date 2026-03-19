'use client';

import { useState } from 'react';
import Link from 'next/link';

const links = [
  { href: '#what-we-test', label: 'What we test' },
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#deploy', label: 'Deploy' },
  { href: 'https://github.com/gofree-ai/gofree', label: 'Docs' },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg p-2 text-foreground/60 hover:text-foreground"
        aria-label="Toggle menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
        )}
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 border-b bg-[#fafafa] px-6 py-4 shadow-lg">
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium text-foreground/60 hover:text-foreground">
                {l.label}
              </Link>
            ))}
            <hr className="my-1 border-foreground/10" />
            <Link href="/login" onClick={() => setOpen(false)} className="text-sm font-medium text-foreground/60">Sign in</Link>
            <Link href="/signup" onClick={() => setOpen(false)} className="inline-flex justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white">Start free trial</Link>
          </div>
        </div>
      )}
    </div>
  );
}
