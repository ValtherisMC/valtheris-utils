'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { toSmallCaps } from '@/lib/small-caps';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from './copy-button';
import { useWebMcpTool } from './webmcp';

export function SmallCapsTool() {
  const [text, setText] = useState('Welcome to Valtheris');
  const output = useMemo(() => toSmallCaps(text), [text]);

  useWebMcpTool(
    useMemo(
      () => ({
        name: 'set_small_caps_text',
        title: 'Set small caps text',
        description:
          'Set the visible Small Caps Generator input and return the converted Minecraft-style small caps output.',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' },
          },
          required: ['text'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          if (!input || typeof input !== 'object') {
            throw new Error('Input must be an object.');
          }
          const value = input as Record<string, unknown>;
          if (typeof value.text !== 'string') {
            throw new Error('Text is required.');
          }
          const converted = toSmallCaps(value.text);
          setText(value.text);
          return { text: value.text, output: converted };
        },
      }),
      [],
    ),
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Small Caps Generator</p>
        <h1 className="mt-1 text-3xl font-semibold">Minecraft-style text</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-white/10 bg-card/70 shadow-xl shadow-black/15">
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-56 resize-y bg-background/55 text-base"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setText('')}>
                <Trash2 className="size-4" aria-hidden="true" />
                Clear
              </Button>
              <p className="text-sm text-muted-foreground">
                {Array.from(text).length} characters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-card/70 shadow-xl shadow-black/15">
          <CardHeader>
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              readOnly
              value={output}
              className="min-h-56 resize-y bg-background/55 font-mono text-base"
            />
            <div className="flex flex-wrap gap-2">
              <CopyButton value={output} />
              <Link
                href={`/dashboard/hex-generator?text=${encodeURIComponent(output)}`}
                aria-disabled={!output}
                className={buttonVariants({
                  className: !output ? 'pointer-events-none opacity-50' : '',
                })}
              >
                Small Caps + Gradient
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              {Array.from(output).length} characters
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
