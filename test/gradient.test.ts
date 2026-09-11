import assert from 'node:assert/strict';
import test from 'node:test';
import {
  type MinecraftTextStyle,
  interpolateGradient,
  isValidHex,
  nearestLegacyColor,
  normalizeHex,
  toAmpersandHex,
  toAmpersandXColor,
  toAmpersandXHex,
  toHashHex,
  toLegacyMinecraft,
  toMiniMessage,
  toSectionXColor,
} from '../lib/gradient.ts';

void test('validates and normalizes HEX colors', () => {
  assert.equal(isValidHex('#FFFFFF'), true);
  assert.equal(isValidHex('ffffff'), true);
  assert.equal(isValidHex('#FFFFF'), false);
  assert.equal(isValidHex('nope'), false);
  assert.equal(normalizeHex('ffffff'), '#FFFFFF');
  assert.equal(normalizeHex('#ff7a18'), '#FF7A18');
  assert.equal(normalizeHex('#CF8AF'), null);
});

void test('interpolates empty, one, two and spaced text', () => {
  assert.deepEqual(interpolateGradient('', '#000000', '#FFFFFF'), []);
  assert.deepEqual(interpolateGradient('A', '#000000', '#FFFFFF'), [
    { char: 'A', color: '#000000' },
  ]);
  assert.deepEqual(interpolateGradient('AB', '#000000', '#FFFFFF'), [
    { char: 'A', color: '#000000' },
    { char: 'B', color: '#FFFFFF' },
  ]);
  assert.deepEqual(interpolateGradient('A B', '#000000', '#FFFFFF'), [
    { char: 'A', color: '#000000' },
    { char: ' ', color: '#808080' },
    { char: 'B', color: '#FFFFFF' },
  ]);
});

void test('generates MiniMessage and HEX output formats', () => {
  assert.equal(toMiniMessage('VAL', '#FF7A18', '#FFB347'), '<gradient:#FF7A18:#FFB347>VAL</gradient>');
  assert.equal(toAmpersandHex('AB', '#000000', '#FFFFFF'), '&#000000A&#FFFFFFB');
  assert.equal(toHashHex('AB', '#000000', '#FFFFFF'), '#000000A#FFFFFFB');
  assert.equal(toAmpersandXColor('#FF7A18'), '&x&F&F&7&A&1&8');
  assert.equal(toSectionXColor('#FF7A18'), '§x§f§f§7§a§1§8');
  assert.equal(toAmpersandXHex('A', '#FF7A18', '#FFB347'), '&x&F&F&7&A&1&8A');
});

void test('applies Minecraft formatting styles to generated output', () => {
  const styles: MinecraftTextStyle[] = ['bold', 'italic', 'underlined'];

  assert.equal(
    toMiniMessage('A', '#FF7A18', '#FFB347', styles),
    '<bold><italic><underlined><gradient:#FF7A18:#FFB347>A</gradient></underlined></italic></bold>',
  );
  assert.equal(toAmpersandHex('A', '#FF7A18', '#FFB347', styles), '&#FF7A18&l&o&nA');
  assert.equal(toHashHex('A', '#FF7A18', '#FFB347', styles), '#FF7A18&l&o&nA');
  assert.equal(
    toLegacyMinecraft('A', '#FFFFFF', '#FFFFFF', styles),
    '§x§f§f§f§f§f§f§l§o§nA',
  );
  assert.equal(toAmpersandXHex('A', '#FF7A18', '#FFB347', styles), '&x&F&F&7&A&1&8&l&o&nA');
});

void test('maps gradients to nearest legacy Minecraft colors', () => {
  assert.deepEqual(nearestLegacyColor('#FFFFFF'), { code: 'f', color: '#FFFFFF' });
  assert.equal(
    toLegacyMinecraft('A!', '#FFFFFF', '#000000'),
    '§x§f§f§f§f§f§fA§x§0§0§0§0§0§0!',
  );
});

void test('returns empty output for invalid colors', () => {
  assert.equal(toAmpersandHex('AB', '#BAD', '#FFFFFF'), '');
  assert.equal(toHashHex('AB', '#BAD', '#FFFFFF'), '');
  assert.equal(toMiniMessage('AB', '#BAD', '#FFFFFF'), '');
});
