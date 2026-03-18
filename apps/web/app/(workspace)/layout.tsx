export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      {/* Activity bar */}
      <aside className="flex w-12 flex-col items-center border-r bg-muted/40 py-2">
        {/* TODO: Activity bar icons */}
      </aside>
      {/* Workspace content */}
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
