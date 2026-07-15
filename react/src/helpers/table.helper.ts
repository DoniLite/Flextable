/* eslint-disable @typescript-eslint/naming-convention */
import type { Row } from '@tanstack/react-table';

export const filterInternDate = <
  T extends { createdAt?: Date | null; updatedAt?: Date | null },
  U extends Record<string | number | symbol, unknown>,
>(
  row: Row<T>,
  _rowId: string,
  updateValue: U,
) => {
  if (updateValue.start instanceof Date && updateValue.end instanceof Date) {
    const start = updateValue.start.getTime();
    const end = updateValue.end.getTime();

    const created = new Date(row.original.createdAt ?? '').getTime();
    const updated = new Date(row.original.updatedAt ?? '').getTime();

    return (
      (updated >= start && updated <= end) ||
      (created >= start && created <= end)
    );
  }
  return false;
};

export const sortInternDate = <
  T extends { createdAt?: Date | null; updatedAt?: Date | null },
>(
  rowA: Row<T>,
  rowB: Row<T>,
  _columnId: string,
) => {
  const rowAUpDate =
    rowA.original.updatedAt && rowA.original.updatedAt instanceof Date
      ? rowA.original.updatedAt
      : typeof rowA.original.updatedAt === 'string'
        ? new Date(rowA.original.updatedAt)
        : undefined;
  const rowBUpDate =
    rowB.original.updatedAt && rowB.original.updatedAt instanceof Date
      ? rowB.original.updatedAt
      : typeof rowB.original.updatedAt === 'string'
        ? new Date(rowB.original.updatedAt)
        : undefined;
  const rowACreateDate =
    rowA.original.createdAt && rowA.original.createdAt instanceof Date
      ? rowA.original.createdAt
      : typeof rowA.original.createdAt === 'string'
        ? new Date(rowA.original.createdAt)
        : new Date();
  const rowBCreateDate =
    rowB.original.createdAt && rowB.original.createdAt instanceof Date
      ? rowB.original.createdAt
      : typeof rowB.original.createdAt === 'string'
        ? new Date(rowB.original.createdAt)
        : new Date();
  if (
    rowAUpDate &&
    rowAUpDate instanceof Date &&
    rowBUpDate &&
    rowBUpDate instanceof Date
  ) {
    return rowAUpDate.getTime() - rowBUpDate.getTime();
  }
  return rowACreateDate.getTime() - rowBCreateDate.getTime();
};
