import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { makeCsrfToken, requireAdminSession } from '@/lib/auth/session';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();
  const csrfToken = await makeCsrfToken(session);

  return (
    <DashboardShell session={session} csrfToken={csrfToken}>
      {children}
    </DashboardShell>
  );
}
