import { getPinnedItemClassFlags } from '@flextable/core';
import type { ColumnPinningPosition, Table } from '@tanstack/react-table';
import { useEffect } from 'react';

export interface UseColumnPinningOptions<TData> {
  table: Table<TData>;
  pinnedColumnId?: string;
  pinOnMobile?: ColumnPinningPosition;
  pinOnDesktop?: ColumnPinningPosition;
  isMobile: boolean;
}

export function useColumnPinning<TData>({
  table,
  isMobile,
  pinnedColumnId,
  pinOnDesktop,
  pinOnMobile,
}: UseColumnPinningOptions<TData>) {
  useEffect(() => {
    if (!pinnedColumnId) return;
    const column = table.getAllColumns().find((col) => col.id === pinnedColumnId);
    if (!column) return;

    const pinDirection: ColumnPinningPosition = isMobile
      ? (pinOnMobile ?? false)
      : (pinOnDesktop ?? false);
    column.pin(pinDirection);
  }, [isMobile, pinnedColumnId, pinOnDesktop, pinOnMobile, table]);

  return { getPinnedItemClassDefinition: getPinnedItemClassFlags };
}
