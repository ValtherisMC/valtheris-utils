'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { hexTemplates } from '@/lib/templates';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CopyButton } from './copy-button';

export function HexTemplatesTool() {
  const [query, setQuery] = useState('');
  const templates = useMemo(
    () =>
      hexTemplates.filter((template) =>
        template.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hex Templates</p>
          <h1 className="mt-1 text-3xl font-semibold">Valtheris gradients</h1>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="bg-background/55 pl-9"
            placeholder="Search template"
          />
        </div>
      </div>

      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.name}
              className="border-white/10 bg-card/70 shadow-xl shadow-black/15"
            >
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="h-16 rounded-lg border border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${template.start}, ${template.end})`,
                  }}
                />
                <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                  <div className="rounded-lg bg-background/55 p-3">{template.start}</div>
                  <div className="rounded-lg bg-background/55 p-3">{template.end}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <CopyButton value={template.start} label="Copy Start" />
                  <CopyButton value={template.end} label="Copy End" />
                </div>
                <Link
                  href={`/dashboard/hex-generator?start=${encodeURIComponent(
                    template.start,
                  )}&end=${encodeURIComponent(template.end)}`}
                  className={buttonVariants({ className: 'w-full' })}
                >
                  Use Template
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-card/60 p-8 text-center text-muted-foreground">
          No templates found.
        </div>
      )}
    </div>
  );
}
