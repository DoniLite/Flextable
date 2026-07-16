import type { ColumnPinningPosition } from '@tanstack/table-core';

/** Class-name flag map for a pinned header/cell at `index` of `itemsLength` — framework renders apply these however they like (Tailwind classes by default). */
export function getPinnedItemClassFlags(
  index: number,
  itemsLength: number,
  pinnedState: ColumnPinningPosition,
): Record<string, boolean> {
  return {
    'pl-4': index === 0,
    'pr-4': index === itemsLength - 1,
    'bg-background sticky z-50 align-middle': pinnedState !== false,
    'right-0': pinnedState === 'right',
    'left-0': pinnedState === 'left',
  };
}
