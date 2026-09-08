export type Rgb = {
  r: number;
  g: number;
  b: number;
};

export type GradientCharacter = {
  char: string;
  color: string;
};

const HEX_PATTERN = /^#?[0-9a-fA-F]{6}$/;

const legacyColors = [
  { code: '&0', color: '#000000' },
  { code: '&1', color: '#0000AA' },
  { code: '&2', color: '#00AA00' },
  { code: '&3', color: '#00AAAA' },
  { code: '&4', color: '#AA0000' },
  { code: '&5', color: '#AA00AA' },
  { code: '&6', color: '#FFAA00' },
  { code: '&7', color: '#AAAAAA' },
  { code: '&8', color: '#555555' },
  { code: '&9', color: '#5555FF' },
  { code: '&a', color: '#55FF55' },
  { code: '&b', color: '#55FFFF' },
  { code: '&c', color: '#FF5555' },
  { code: '&d', color: '#FF55FF' },
  { code: '&e', color: '#FFFF55' },
  { code: '&f', color: '#FFFFFF' },
] as const;

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value.trim());
}

export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (!isValidHex(trimmed)) return null;
  const normalized = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  return normalized.toUpperCase();
}

export function interpolateGradient(
  text: string,
  startHex: string,
  endHex: string,
): GradientCharacter[] {
  const start = normalizeHex(startHex);
  const end = normalizeHex(endHex);
  if (!start || !end) return [];

  const characters = Array.from(text);
  if (characters.length === 0) return [];
  if (characters.length === 1) {
    return [{ char: characters[0]!, color: start }];
  }

  const startRgb = hexToRgb(start);
  const endRgb = hexToRgb(end);

  return characters.map((char, index) => {
    const ratio = index / (characters.length - 1);
    return {
      char,
      color: rgbToHex({
        r: lerp(startRgb.r, endRgb.r, ratio),
        g: lerp(startRgb.g, endRgb.g, ratio),
        b: lerp(startRgb.b, endRgb.b, ratio),
      }),
    };
  });
}

export function toMiniMessage(text: string, startHex: string, endHex: string): string {
  const start = normalizeHex(startHex);
  const end = normalizeHex(endHex);
  if (!start || !end || text.length === 0) return '';
  return `<gradient:${start}:${end}>${escapeMiniMessageText(text)}</gradient>`;
}

export function toPreciseMiniMessage(
  text: string,
  startHex: string,
  endHex: string,
): string {
  return interpolateGradient(text, startHex, endHex)
    .map(({ char, color }) => `<${color}>${escapeMiniMessageText(char)}`)
    .join('');
}

export function toAmpersandHex(
  text: string,
  startHex: string,
  endHex: string,
): string {
  return interpolateGradient(text, startHex, endHex)
    .map(({ char, color }) => `&${color}${char}`)
    .join('');
}

export function toHashHex(text: string, startHex: string, endHex: string): string {
  return interpolateGradient(text, startHex, endHex)
    .map(({ char, color }) => `${color}${char}`)
    .join('');
}

export function toLegacyMinecraft(
  text: string,
  startHex: string,
  endHex: string,
): string {
  return interpolateGradient(text, startHex, endHex)
    .map(({ char, color }) => `${nearestLegacyColor(color).code}${char}`)
    .join('');
}

export function toAmpersandXHex(
  text: string,
  startHex: string,
  endHex: string,
): string {
  return interpolateGradient(text, startHex, endHex)
    .map(({ char, color }) => `${toAmpersandXColor(color)}${char}`)
    .join('');
}

export function toAmpersandXColor(hex: string): string {
  const normalized = normalizeHex(hex);
  if (!normalized) return '';
  return `&x${Array.from(normalized.slice(1))
    .map((char) => `&${char}`)
    .join('')}`;
}

export function nearestLegacyColor(hex: string): { code: string; color: string } {
  const target = hexToRgb(normalizeHex(hex) ?? '#000000');
  const closest = legacyColors.reduce<{ code: string; color: string; distance: number }>(
    (best, candidate) => {
      const distance = colorDistance(target, hexToRgb(candidate.color));
      return distance < best.distance ? { ...candidate, distance } : best;
    },
    { ...legacyColors[0], distance: Number.POSITIVE_INFINITY },
  );

  return { code: closest.code, color: closest.color };
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error(`Invalid HEX color: ${hex}`);
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  };
}

export function rgbToHex(rgb: Rgb): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((value) => Math.round(value).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()}`;
}

function lerp(start: number, end: number, ratio: number): number {
  return start + (end - start) * ratio;
}

function colorDistance(a: Rgb, b: Rgb): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function escapeMiniMessageText(text: string): string {
  return text.replaceAll('\\', '\\\\').replaceAll('<', '\\<');
}
