import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AlertTriangle, LockKeyhole, ShieldCheck } from 'lucide-react';
import { getCurrentSession } from '@/lib/auth/session';
import { getEnvStatus } from '@/lib/env';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';

export default async function Home() {
  const envStatus = getEnvStatus();
  const session = await getCurrentSession();

  if (session?.isAdmin) redirect('/dashboard');
  if (session && !session.isAdmin) redirect('/access-denied');

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,oklch(0.34_0.14_277/.46),transparent_34%),radial-gradient(circle_at_80%_0%,oklch(0.32_0.12_214/.28),transparent_30%),var(--background)] px-5 py-8 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/7 px-3 py-2 text-sm text-muted-foreground backdrop-blur">
              <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
              Discord Administrator only
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-6xl">
              Valtheris Tools
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              Dashboard privat pentru gradientele Minecraft, template-urile HEX si
              textul small caps folosit de echipa serverului.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-card/75 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
            <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-primary/20 text-primary ring-1 ring-primary/25">
              <LockKeyhole className="size-6" aria-hidden="true" />
            </div>
            <h2 className="text-2xl font-semibold">Login securizat</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Accesul este verificat prin Discord OAuth2 si permis doar conturilor
              cu permisiunea Administrator pe serverul configurat.
            </p>
            {envStatus.ok ? (
              <Link
                href="/api/auth/login"
                prefetch={false}
                className={buttonVariants({
                  className: 'mt-6 h-11 w-full text-base',
                })}
              >
                Login with Discord
              </Link>
            ) : (
              <Alert className="mt-6 border-destructive/35 bg-destructive/10">
                <AlertTriangle className="size-4" aria-hidden="true" />
                <AlertTitle>Configurare lipsa</AlertTitle>
                <AlertDescription>
                  Completeaza variabilele din .env inainte de autentificare:
                  {' '}
                  {envStatus.missing.join(', ') || 'SESSION_SECRET'}
                  {envStatus.weakSecret
                    ? '. SESSION_SECRET trebuie sa aiba cel putin 32 de caractere.'
                    : '.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
