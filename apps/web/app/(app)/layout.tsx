import { UserMenu } from '@/components/user-menu';
import { Greeting } from '@/components/greeting';
import { OrgSwitcher } from '@/components/org-switcher';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-14 items-center gap-2 border-b px-5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background text-xs font-bold">G</div>
          <span className="font-semibold tracking-tight">GoFree</span>
        </div>
        <nav className="flex-1 p-4">
          <OrgSwitcher />
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b bg-card px-5 lg:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background text-xs font-bold">G</div>
            <span className="font-semibold">GoFree</span>
          </div>
          <div className="flex-1 px-4">
            <Greeting />
          </div>
          <UserMenu />
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
