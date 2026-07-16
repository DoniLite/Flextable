import { getPinnedItemClassFlags } from '@flextable/core';
import type { ColumnPinningPosition, Table } from '@tanstack/vue-table';
import type { Ref } from 'vue';
import { watch } from 'vue';

export interface UseColumnPinningOptions<TData> {
  table: Table<TData>;
  pinnedColumnId?: string;
  pinOnMobile?: ColumnPinningPosition;
  pinOnDesktop?: ColumnPinningPosition;
  isMobile: Ref<boolean>;
}

export function useColumnPinning<TData>(options: UseColumnPinningOptions<TData>) {
  watch(
    [
      () => options.isMobile.value,
      () => options.pinnedColumnId,
      () => options.pinOnMobile,
      () => options.pinOnDesktop,
    ],
    ([isMobileValue, pinnedColumnId, pinOnMobile, pinOnDesktop]) => {
      if (!pinnedColumnId) return;
      const column = options.table.getColumn(pinnedColumnId);
      if (!column) return;

      const pinDirection: ColumnPinningPosition = isMobileValue
        ? (pinOnMobile ?? false)
        : (pinOnDesktop ?? false);
      column.pin(pinDirection);
    },
    { immediate: true },
  );

  return { getPinnedItemClassDefinition: getPinnedItemClassFlags };
}
