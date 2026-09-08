import { Button } from '@/components/ui/button';

export function LogoutButton({
  csrfToken,
  compact = false,
}: {
  csrfToken: string;
  compact?: boolean;
}) {
  return (
    <form action="/api/auth/logout" method="post">
      <input type="hidden" name="csrf" value={csrfToken} />
      <Button
        type="submit"
        variant="ghost"
        size={compact ? 'icon-lg' : 'lg'}
        className="w-full justify-start text-muted-foreground hover:text-foreground"
        aria-label="Logout"
      >
        {compact ? 'Out' : 'Logout'}
      </Button>
    </form>
  );
}
