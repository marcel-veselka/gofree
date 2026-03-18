export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 lg:block">
        <div className="flex h-14 items-center border-b px-4 font-semibold">GoFree</div>
        <nav className="space-y-1 p-4">
          {/* TODO: Org/project nav items */}
          <p className="text-sm text-muted-foreground">Navigation coming soon.</p>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
