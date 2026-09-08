import assert from 'node:assert/strict';
import test from 'node:test';
import { toSmallCaps } from '../lib/small-caps.ts';

void test('converts alphabetic text to small caps', () => {
  assert.equal(toSmallCaps('Welcome to Valtheris'), 'ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴠᴀʟᴛʜᴇʀɪꜱ');
});

void test('preserves digits, symbols, spaces and unknown characters', () => {
  assert.equal(toSmallCaps('A1 ! x'), 'ᴀ1 ! x');
});

void test('handles empty text', () => {
  assert.equal(toSmallCaps(''), '');
});
