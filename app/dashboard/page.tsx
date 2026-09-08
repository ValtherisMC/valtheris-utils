import Link from 'next/link';
import { Blocks, Palette, Type } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAdminSession } from '@/lib/auth/session';

const cards = [
  {
    href: '/dashboard/hex-generator',
    title: 'Hex Generator',
    description: 'Generate Minecraft gradients in multiple formats.',
    icon: Palette,
  },
  {
    href: '/dashboard/hex-templates',
    title: 'Hex Templates',
    description: 'Quick access to predefined Valtheris gradients.',
    icon: Blocks,
  },
  {
    href: '/dashboard/small-caps',
    title: 'Small Caps',
    description: 'Convert normal text into Minecraft-style small caps.',
    icon: Type,
  },
] as const;

export default async function DashboardPage() {
  const session = await requireAdminSession();
  const displayName = session.user.displayName ?? session.user.username;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-white/10 bg-card/70 p-5 shadow-xl shadow-black/15 backdrop-blur">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <h1 className="mt-1 text-3xl font-semibold">{session.user.username}</h1>
            <p className="mt-2 text-muted-foreground">{displayName}</p>
          </div>
          <Avatar size="lg" className="size-16 ring-2 ring-primary/25">
            {session.user.avatarUrl ? (
              <AvatarImage src={session.user.avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href}>
              <Card className="h-full border-white/10 bg-card/65 shadow-lg shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:bg-card">
                <CardHeader>
                  <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{card.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground">
                  {card.description}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
