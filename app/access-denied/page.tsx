import { ShieldX } from 'lucide-react';
import { getCurrentSession, makeCsrfToken } from '@/lib/auth/session';
import { LogoutButton } from '@/components/dashboard/logout-button';

export default async function AccessDeniedPage() {
  const session = await getCurrentSession();
  const csrfToken = session ? await makeCsrfToken(session) : '';

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5">
      <section className="w-full max-w-md rounded-xl border border-white/10 bg-card p-6 shadow-2xl shadow-black/25">
        <div className="mb-5 flex size-12 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
          <ShieldX className="size-6" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold">Access Denied</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Doar administratorii serverului Discord configurat pot folosi dashboard-ul
          Valtheris Tools.
        </p>
        {session ? (
          <div className="mt-6">
            <LogoutButton csrfToken={csrfToken} />
          </div>
        ) : null}
      </section>
    </main>
  );
}
