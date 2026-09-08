'use client';

import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  Blocks,
  Gem,
  Home,
  LogOut,
  Menu,
  Palette,
  Sparkles,
  Type,
} from 'lucide-react';
import type { AppSession } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/hex-generator', label: 'Hex Generator', icon: Palette },
  { href: '/dashboard/hex-templates', label: 'Hex Templates', icon: Blocks },
  { href: '/dashboard/small-caps', label: 'Small Caps', icon: Type },
  { href: '/dashboard/symbols', label: 'Symbols', icon: Gem },
] as const;

export function DashboardShell({
  session,
  csrfToken,
  children,
}: {
  session: AppSession;
  csrfToken: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[radial-gradient(circle_at_20%_0%,oklch(0.28_0.11_282/.55),transparent_32%),radial-gradient(circle_at_85%_10%,oklch(0.32_0.12_214/.34),transparent_30%),var(--background)] text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1480px]">
          <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-white/10 bg-background/55 p-4 backdrop-blur-xl lg:block">
            <SidebarContent csrfToken={csrfToken} />
          </aside>
          <main className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-white/10 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger render={<Button variant="outline" size="icon-lg" />}>
                    <Menu aria-hidden="true" />
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 border-white/10 bg-background p-4">
                    <SidebarContent csrfToken={csrfToken} />
                  </SheetContent>
                </Sheet>
                <div>
                  <p className="text-sm text-muted-foreground">Valtheris Tools</p>
                  <p className="text-base font-medium">Dashboard privat</p>
                </div>
              </div>
              <UserBadge session={session} />
            </header>
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

function SidebarContent({ csrfToken }: { csrfToken: string }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-5">
      <a href="/dashboard" className="flex items-center gap-3 rounded-lg px-2 py-2">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/25">
          <Sparkles className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold">Valtheris</p>
          <p className="text-sm text-muted-foreground">Minecraft utilities</p>
        </div>
      </a>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-white/7 hover:text-foreground',
                active && 'bg-white/10 text-foreground shadow-sm ring-1 ring-white/10',
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="mt-auto">
        <form action="/api/auth/logout" method="post">
          <input type="hidden" name="csrf" value={csrfToken} />
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );
}

function UserBadge({ session }: { session: AppSession }) {
  const displayName = session.user.displayName ?? session.user.username;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex min-w-0 items-center gap-3">
      <Tooltip>
        <TooltipTrigger>
          <Badge className="hidden border-primary/25 bg-primary/15 text-primary sm:inline-flex">
            <BadgeCheck className="mr-1 size-3.5" aria-hidden="true" />
            Administrator
          </Badge>
        </TooltipTrigger>
        <TooltipContent>Permisiune Discord verificata server-side</TooltipContent>
      </Tooltip>
      <Avatar size="lg" className="ring-2 ring-primary/25">
        {session.user.avatarUrl ? (
          <AvatarImage src={session.user.avatarUrl} alt={displayName} />
        ) : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="hidden min-w-0 sm:block">
        <p className="truncate text-sm font-medium">{displayName}</p>
        <p className="truncate text-xs text-muted-foreground">@{session.user.username}</p>
      </div>
    </div>
  );
}
