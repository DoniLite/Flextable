import { describe, expect, test } from 'bun:test';
import { resolveClassName } from './className';

describe('resolveClassName', () => {
  test('returns an empty string when className is undefined', () => {
    expect(resolveClassName(undefined, { id: 1 })).toBe('');
  });

  test('returns the string as-is when className is a plain string', () => {
    expect(resolveClassName('text-red-500', { id: 1 })).toBe('text-red-500');
  });

  test('invokes the callback with the entity when className is a function', () => {
    const className = (entity: { active: boolean }) => (entity.active ? 'on' : 'off');
    expect(resolveClassName(className, { active: true })).toBe('on');
    expect(resolveClassName(className, { active: false })).toBe('off');
  });

  test('returns an empty string when a callback className has no entity to call with', () => {
    const className = () => 'unused';
    expect(resolveClassName(className, undefined)).toBe('');
  });
});
