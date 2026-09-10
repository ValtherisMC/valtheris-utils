'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ComponentType, CSSProperties } from 'react';
import {
  ArrowRightLeft,
  Bold,
  Dices,
  Italic,
  RotateCcw,
  Shuffle,
  Strikethrough,
  Underline,
} from 'lucide-react';
import {
  type MinecraftTextStyle,
  interpolateGradient,
  normalizeHex,
  toAmpersandHex,
  toAmpersandXHex,
  toHashHex,
  toLegacyMinecraft,
  toMiniMessage,
  toPreciseMiniMessage,
} from '@/lib/gradient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CopyButton } from './copy-button';
import { useWebMcpTool } from './webmcp';

const defaultText = 'VALTHERIS';
const defaultStart = '#FF7A18';
const defaultEnd = '#FFB347';

const styleOptions = [
  { id: 'bold', label: 'Bold', code: '&l', icon: Bold },
  { id: 'italic', label: 'Italic', code: '&o', icon: Italic },
  { id: 'underlined', label: 'Underline', code: '&n', icon: Underline },
  { id: 'strikethrough', label: 'Strike', code: '&m', icon: Strikethrough },
  { id: 'obfuscated', label: 'Magic', code: '&k', icon: Shuffle },
] as const satisfies readonly {
  id: MinecraftTextStyle;
  label: string;
  code: string;
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}[];

const styleOrder = styleOptions.map((option) => option.id);

export function HexGeneratorTool() {
  const params = useSearchParams();
  const [text, setText] = useState(params.get('text') ?? defaultText);
  const [start, setStart] = useState(params.get('start') ?? defaultStart);
  const [end, setEnd] = useState(params.get('end') ?? defaultEnd);
  const [styles, setStyles] = useState<MinecraftTextStyle[]>([]);

  const normalizedStart = normalizeHex(start);
  const normalizedEnd = normalizeHex(end);
  const isValid = Boolean(normalizedStart && normalizedEnd);
  const gradient = useMemo(
    () => (isValid ? interpolateGradient(text, normalizedStart!, normalizedEnd!) : []),
    [text, normalizedStart, normalizedEnd, isValid],
  );
  const outputs = useMemo(
    () =>
      isValid
        ? {
            minimessage: toMiniMessage(text, normalizedStart!, normalizedEnd!, styles),
            precise: toPreciseMiniMessage(text, normalizedStart!, normalizedEnd!, styles),
            ampersand: toAmpersandHex(text, normalizedStart!, normalizedEnd!, styles),
            hash: toHashHex(text, normalizedStart!, normalizedEnd!, styles),
            legacy: toLegacyMinecraft(text, normalizedStart!, normalizedEnd!, styles),
            ampersandX: toAmpersandXHex(text, normalizedStart!, normalizedEnd!, styles),
          }
        : null,
    [text, normalizedStart, normalizedEnd, styles, isValid],
  );
  const previewStyle = useMemo(() => makePreviewStyle(styles), [styles]);

  useWebMcpTool(
    useMemo(
      () => ({
        name: 'set_minecraft_gradient',
        title: 'Set Minecraft gradient',
        description:
          'Set the visible gradient generator text and HEX colors, then return all generated Minecraft formats.',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            startColor: { type: 'string', pattern: '^#?[0-9a-fA-F]{6}$' },
            endColor: { type: 'string', pattern: '^#?[0-9a-fA-F]{6}$' },
            styles: {
              type: 'array',
              items: {
                type: 'string',
                enum: styleOrder,
              },
            },
          },
          required: ['text', 'startColor', 'endColor'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false, untrustedContentHint: false },
        execute(input: unknown) {
          const value = parseGradientInput(input);
          const nextStart = normalizeHex(value.startColor);
          const nextEnd = normalizeHex(value.endColor);
          if (!nextStart || !nextEnd) {
            throw new Error('Invalid HEX color.');
          }
          setText(value.text);
          setStart(nextStart);
          setEnd(nextEnd);
          setStyles(value.styles);
          return {
            text: value.text,
            startColor: nextStart,
            endColor: nextEnd,
            styles: value.styles,
            outputs: {
              minimessage: toMiniMessage(value.text, nextStart, nextEnd, value.styles),
              preciseMiniMessage: toPreciseMiniMessage(
                value.text,
                nextStart,
                nextEnd,
                value.styles,
              ),
              ampersandHex: toAmpersandHex(value.text, nextStart, nextEnd, value.styles),
              hashHex: toHashHex(value.text, nextStart, nextEnd, value.styles),
              legacyMinecraft: toLegacyMinecraft(
                value.text,
                nextStart,
                nextEnd,
                value.styles,
              ),
              ampersandX: toAmpersandXHex(value.text, nextStart, nextEnd, value.styles),
            },
          };
        },
      }),
      [],
    ),
  );

  function normalizeOnBlur(kind: 'start' | 'end') {
    const normalized = normalizeHex(kind === 'start' ? start : end);
    if (!normalized) return;
    if (kind === 'start') setStart(normalized);
    if (kind === 'end') setEnd(normalized);
  }

  function randomize() {
    setStart(randomHex());
    setEnd(randomHex());
  }

  function toggleStyle(style: MinecraftTextStyle) {
    setStyles((current) =>
      current.includes(style)
        ? current.filter((item) => item !== style)
        : [...current, style].sort(
            (left, right) => styleOrder.indexOf(left) - styleOrder.indexOf(right),
          ),
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Hex Generator</p>
        <h1 className="mt-1 text-3xl font-semibold">Minecraft gradient builder</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
        <Card className="border-white/10 bg-card/70 shadow-xl shadow-black/15">
          <CardHeader>
            <CardTitle>Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="gradient-text">Text</Label>
              <Textarea
                id="gradient-text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                className="min-h-28 resize-y bg-background/55"
              />
              <p className="text-sm text-muted-foreground">
                {Array.from(text).length} characters
              </p>
            </div>

            <ColorField
              id="start-color"
              label="Start Color"
              value={start}
              valid={Boolean(normalizedStart)}
              onChange={setStart}
              onBlur={() => normalizeOnBlur('start')}
            />
            <ColorField
              id="end-color"
              label="End Color"
              value={end}
              valid={Boolean(normalizedEnd)}
              onChange={setEnd}
              onBlur={() => normalizeOnBlur('end')}
            />

            <div className="space-y-2">
              <Label>Formatting</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {styleOptions.map((option) => {
                  const Icon = option.icon;
                  const active = styles.includes(option.id);
                  return (
                    <Button
                      key={option.id}
                      type="button"
                      variant={active ? 'secondary' : 'outline'}
                      aria-pressed={active}
                      onClick={() => toggleStyle(option.id)}
                      className="justify-start"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span>{option.label}</span>
                      <span className="ml-auto font-mono text-xs text-muted-foreground">
                        {option.code}
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStart(end);
                  setEnd(start);
                }}
              >
                <ArrowRightLeft className="size-4" aria-hidden="true" />
                Swap
              </Button>
              <Button type="button" variant="outline" onClick={randomize}>
                <Dices className="size-4" aria-hidden="true" />
                Random
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setText(defaultText);
                  setStart(defaultStart);
                  setEnd(defaultEnd);
                  setStyles([]);
                }}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-white/10 bg-card/70 shadow-xl shadow-black/15">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {isValid ? (
                <div className="min-h-28 rounded-lg border border-white/10 bg-background/55 p-5 font-mono text-3xl font-semibold leading-relaxed">
                  {gradient.length > 0 ? (
                    gradient.map((item, index) => (
                      <span
                        key={`${item.char}-${index}`}
                        style={{ ...previewStyle, color: item.color }}
                      >
                        {item.char}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Empty text</span>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                  HEX invalid. Foloseste formatul #FFFFFF sau FFFFFF.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-card/70 shadow-xl shadow-black/15">
            <CardHeader>
              <CardTitle>Formats</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="minimessage">
                <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start bg-background/60">
                  <TabsTrigger value="minimessage">MiniMessage</TabsTrigger>
                  <TabsTrigger value="ampersand">Ampersand HEX</TabsTrigger>
                  <TabsTrigger value="hash">Hash HEX</TabsTrigger>
                  <TabsTrigger value="legacy">Legacy</TabsTrigger>
                  <TabsTrigger value="ampersandX">&x&</TabsTrigger>
                </TabsList>
                <OutputTab value="minimessage" output={outputs?.minimessage ?? ''}>
                  <p className="mb-3 text-sm text-muted-foreground">
                    Precise per-character: {outputs?.precise || 'No output'}
                  </p>
                </OutputTab>
                <OutputTab value="ampersand" output={outputs?.ampersand ?? ''} />
                <OutputTab value="hash" output={outputs?.hash ?? ''} />
                <OutputTab value="legacy" output={outputs?.legacy ?? ''} />
                <OutputTab value="ampersandX" output={outputs?.ampersandX ?? ''} />
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  valid,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  valid: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const pickerValue = normalizeHex(value) ?? '#FFFFFF';

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="grid grid-cols-[48px_1fr] gap-2">
        <input
          aria-label={`${label} picker`}
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="h-10 w-12 rounded-lg border border-white/10 bg-transparent"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={!valid}
          className="bg-background/55 font-mono"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  );
}

function OutputTab({
  value,
  output,
  children,
}: {
  value: string;
  output: string;
  children?: React.ReactNode;
}) {
  return (
    <TabsContent value={value} className="space-y-3">
      {children}
      <Textarea
        readOnly
        value={output}
        className="min-h-36 resize-y bg-background/55 font-mono text-sm"
      />
      <CopyButton value={output} label="Copy output" />
    </TabsContent>
  );
}

function randomHex(): string {
  return `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase()}`;
}

function parseGradientInput(input: unknown): {
  text: string;
  startColor: string;
  endColor: string;
  styles: MinecraftTextStyle[];
} {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object.');
  }
  const value = input as Record<string, unknown>;
  if (
    typeof value.text !== 'string' ||
    typeof value.startColor !== 'string' ||
    typeof value.endColor !== 'string'
  ) {
    throw new Error('Text, startColor and endColor are required.');
  }
  return {
    text: value.text,
    startColor: value.startColor,
    endColor: value.endColor,
    styles: parseStyles(value.styles),
  };
}

function parseStyles(input: unknown): MinecraftTextStyle[] {
  if (!Array.isArray(input)) return [];

  return styleOrder.filter((style) => input.includes(style));
}

function makePreviewStyle(styles: MinecraftTextStyle[]): CSSProperties {
  const decorations = [
    styles.includes('underlined') ? 'underline' : '',
    styles.includes('strikethrough') ? 'line-through' : '',
  ].filter(Boolean);

  return {
    fontWeight: styles.includes('bold') ? 800 : 600,
    fontStyle: styles.includes('italic') ? 'italic' : 'normal',
    textDecoration: decorations.join(' ') || 'none',
    filter: styles.includes('obfuscated') ? 'blur(0.4px)' : undefined,
  };
}
