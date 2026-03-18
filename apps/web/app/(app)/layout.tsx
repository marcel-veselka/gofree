import { UserMenu } from '@/components/user-menu';
import { Greeting } from '@/components/greeting';
import { OrgSwitcher } from '@/components/org-switcher';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 border-r bg-muted/40 lg:block">
        <div className="flex h-14 items-center border-b px-4 font-semibold">GoFree</div>
        <nav className="p-4">
          <OrgSwitcher />
        </nav>
      </aside>
      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-4 lg:px-6">
          <div className="font-semibold lg:hidden">GoFree</div>
          <div className="flex-1 px-4">
            <Greeting />
          </div>
          <UserMenu />
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
