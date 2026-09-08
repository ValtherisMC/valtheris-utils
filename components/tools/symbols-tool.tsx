'use client';

import { useMemo, useState } from 'react';
import { Copy, Search } from 'lucide-react';
import { symbolCategories, type MinecraftSymbol } from '@/lib/symbols';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';

export function SymbolsTool() {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();

  const allSymbols = useMemo(
    () => symbolCategories.flatMap((category) => category.symbols),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Symbols</p>
          <h1 className="mt-1 text-3xl font-semibold">Minecraft symbols</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Simboluri simple pentru rank-uri, chat, lore, scoreboard si meniuri.
            Compatibilitatea poate depinde de versiune, font si plugin.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="bg-background/55 pl-9"
            placeholder="Search symbol"
          />
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-5 flex h-auto w-full flex-wrap justify-start bg-background/60">
          <TabsTrigger value="all">All</TabsTrigger>
          {symbolCategories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <SymbolPanel
            title="All symbols"
            description="Lista completa, pregatita pentru copy rapid."
            symbols={filterSymbols(allSymbols, normalizedQuery)}
          />
        </TabsContent>

        {symbolCategories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <SymbolPanel
              title={category.label}
              description={category.description}
              symbols={filterSymbols(category.symbols, normalizedQuery)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function SymbolPanel({
  title,
  description,
  symbols,
}: {
  title: string;
  description: string;
  symbols: MinecraftSymbol[];
}) {
  const joinedSymbols = symbols.map((item) => item.symbol).join(' ');

  return (
    <Card className="border-white/10 bg-card/70 shadow-xl shadow-black/15">
      <CardHeader className="gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={symbols.length === 0}
          onClick={() => void copyValue(joinedSymbols, 'Symbols copied!')}
        >
          <Copy className="size-4" aria-hidden="true" />
          Copy all
        </Button>
      </CardHeader>
      <CardContent>
        {symbols.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {symbols.map((item) => (
              <button
                key={`${item.symbol}-${item.name}`}
                type="button"
                onClick={() => void copyValue(item.symbol, 'Copied!')}
                className="group min-h-28 rounded-lg border border-white/10 bg-background/50 p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-background/75 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                aria-label={`Copy ${item.name}`}
              >
                <span className="block text-center text-4xl leading-none text-foreground transition group-hover:text-primary">
                  {item.symbol}
                </span>
                <span className="mt-3 block truncate text-sm font-medium">
                  {item.name}
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  click to copy
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 bg-background/45 p-8 text-center text-muted-foreground">
            No symbols found.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function filterSymbols(
  symbols: MinecraftSymbol[],
  normalizedQuery: string,
): MinecraftSymbol[] {
  if (!normalizedQuery) return symbols;

  return symbols.filter((item) =>
    [item.symbol, item.name, ...item.keywords]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery),
  );
}

async function copyValue(value: string, title: string) {
  if (!value) return;
  await navigator.clipboard.writeText(value);
  toast.add({
    title,
    description: 'Textul a fost copiat in clipboard.',
    type: 'success',
  });
}
