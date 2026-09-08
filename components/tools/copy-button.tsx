'use client';

import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export function CopyButton({
  value,
  label = 'Copy',
  disabled = false,
}: {
  value: string;
  label?: string;
  disabled?: boolean;
}) {
  async function copy() {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    toast.add({
      title: 'Copied!',
      description: 'Textul a fost copiat in clipboard.',
      type: 'success',
    });
  }

  return (
    <Button type="button" onClick={copy} disabled={disabled || !value} variant="outline">
      <Copy className="size-4" aria-hidden="true" />
      {label}
    </Button>
  );
}
