import { useEffect } from 'react';
import type { ColumnPinningPosition, Table } from '@tanstack/react-table';

interface UseColumnPinningOptions<TData> {
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
  // Helper function to generate class object for pinned cells/headers
  const getPinnedItemClassDefinition = (
    index: number,
    itemsLength: number,
    pinnedState: ColumnPinningPosition,
  ) => {
    return {
      'pl-4': index === 0,
      'pr-4': index === itemsLength - 1,
      'bg-background sticky z-50 align-middle': pinnedState !== false,
      'right-0': pinnedState === 'right',
      'left-0': pinnedState === 'left',
    };
  };

  // Watch for changes in mobile state and pinning configuration
  useEffect(() => {
    // Only proceed if a column ID is specified
    if (!pinnedColumnId) {
      return;
    }

    // Get the column by ID safely by iterating columns
    const column = table
      .getAllColumns()
      .find((col) => col.id === pinnedColumnId);

    if (!column) {
      return;
    }

    // Determine which pin direction to use based on device type
    let pinDirection: ColumnPinningPosition = false;

    if (isMobile) {
      // For mobile devices
      pinDirection = pinOnMobile ?? false;
    } else {
      // For desktop devices
      pinDirection = pinOnDesktop ?? false;
    }

    // Apply the pin direction to the column
    column.pin(pinDirection);
  }, [isMobile, pinnedColumnId, pinOnDesktop, pinOnMobile, table]);

  return {
    getPinnedItemClassDefinition,
  };
}
