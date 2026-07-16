import type { Row } from '@tanstack/table-core';

export interface DateStampedEntity {
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface DateRangeFilterValue {
  start?: unknown;
  end?: unknown;
}

function toDate(value: Date | string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/** Row filter matching entities whose `createdAt`/`updatedAt` falls within a `{ start, end }` Date range. */
export function filterInternDate<T extends DateStampedEntity>(
  row: Row<T>,
  _columnId: string,
  updateValue: DateRangeFilterValue,
): boolean {
  if (!(updateValue.start instanceof Date) || !(updateValue.end instanceof Date)) {
    return false;
  }
  const start = updateValue.start.getTime();
  const end = updateValue.end.getTime();

  const created = toDate(row.original.createdAt)?.getTime();
  const updated = toDate(row.original.updatedAt)?.getTime();

  return (
    (updated !== undefined && updated >= start && updated <= end) ||
    (created !== undefined && created >= start && created <= end)
  );
}

/** Sorting fn comparing `updatedAt`, falling back to `createdAt` when either row lacks it. */
export function sortInternDate<T extends DateStampedEntity>(
  rowA: Row<T>,
  rowB: Row<T>,
  _columnId: string,
): number {
  const updatedA = toDate(rowA.original.updatedAt);
  const updatedB = toDate(rowB.original.updatedAt);
  if (updatedA && updatedB) {
    return updatedA.getTime() - updatedB.getTime();
  }

  const createdA = toDate(rowA.original.createdAt) ?? new Date();
  const createdB = toDate(rowB.original.createdAt) ?? new Date();
  return createdA.getTime() - createdB.getTime();
}
