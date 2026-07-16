import { describe, expect, test } from 'bun:test';
import { getPinnedItemClassFlags } from './pinning';

describe('getPinnedItemClassFlags', () => {
  test('flags the first and last item padding regardless of pinning', () => {
    expect(getPinnedItemClassFlags(0, 3, false)).toMatchObject({
      'pl-4': true,
      'pr-4': false,
    });
    expect(getPinnedItemClassFlags(2, 3, false)).toMatchObject({
      'pl-4': false,
      'pr-4': true,
    });
  });

  test('applies sticky background only when pinned', () => {
    expect(
      getPinnedItemClassFlags(1, 3, false)['bg-background sticky z-50 align-middle'],
    ).toBe(false);
    expect(
      getPinnedItemClassFlags(1, 3, 'left')['bg-background sticky z-50 align-middle'],
    ).toBe(true);
  });

  test('sets the correct side flag for left/right pinning', () => {
    expect(getPinnedItemClassFlags(1, 3, 'left')).toMatchObject({
      'left-0': true,
      'right-0': false,
    });
    expect(getPinnedItemClassFlags(1, 3, 'right')).toMatchObject({
      'left-0': false,
      'right-0': true,
    });
  });
});
