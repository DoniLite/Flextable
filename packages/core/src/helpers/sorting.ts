import type { SortingState } from '@tanstack/table-core';

export type SortOrderDirection = 'asc' | 'desc';

export interface SortByPropArgs<T> {
  prop: keyof T;
  priorityProp?: keyof T;
  order?: SortOrderDirection;
}

export function sortAlphabetically(a: string, b: string): number {
  const lowerA = a.toLowerCase();
  const lowerB = b.toLowerCase();
  if (lowerA < lowerB) return -1;
  if (lowerA > lowerB) return 1;
  return 0;
}

export function sortAlphabeticallyByProp<T>({
  prop,
  priorityProp,
  order = 'asc',
}: SortByPropArgs<T>): (a: T, b: T) => number {
  return (a: T, b: T) => {
    if (!priorityProp || a[priorityProp] === b[priorityProp]) {
      const propA = a[prop];
      const propB = b[prop];
      if (typeof propA === 'string' && typeof propB === 'string') {
        const result = propA.toLowerCase().localeCompare(propB.toLowerCase());
        return order === 'asc' ? result : result * -1;
      }
      return 0;
    }
    return a[priorityProp] ? -1 : 1;
  };
}

export function sortByNumericProp<T>({
  prop,
  priorityProp,
  order = 'asc',
}: SortByPropArgs<T>): (a: T, b: T) => number {
  return (a: T, b: T) => {
    if (!priorityProp || a[priorityProp] === b[priorityProp]) {
      const propA = a[prop];
      const propB = b[prop];
      if (typeof propA === 'number' && typeof propB === 'number') {
        let result = 0;
        if (propA < propB) result = -1;
        if (propA > propB) result = 1;
        return order === 'asc' ? result : result * -1;
      }
      return 0;
    }
    return a[priorityProp] ? -1 : 1;
  };
}

export function sortByDateProp<T>({
  prop,
  priorityProp,
  order = 'desc',
}: SortByPropArgs<T>): (a: T, b: T) => number {
  return (a: T, b: T) => {
    if (priorityProp && a[priorityProp] !== b[priorityProp]) {
      return a[priorityProp] ? -1 : 1;
    }

    const propA = a[prop];
    const propB = b[prop];
    const isComparable = (value: unknown): value is Date | string | number =>
      value instanceof Date || typeof value === 'string' || typeof value === 'number';

    if (!isComparable(propA) || !isComparable(propB)) {
      return 0;
    }

    const dateA = new Date(propA);
    const dateB = new Date(propB);
    if (Number.isNaN(dateA.getTime()) || Number.isNaN(dateB.getTime())) {
      return 0;
    }

    return order === 'asc'
      ? dateA.getTime() - dateB.getTime()
      : dateB.getTime() - dateA.getTime();
  };
}

/**
 * Applies sorting to a plain data array based on TanStack's sorting state,
 * inferring numeric/date/alphabetical comparison from the sampled value type.
 */
export function applySorting<TData extends Record<string, unknown>>(
  data: Array<TData>,
  sortingState: SortingState,
): Array<TData> {
  const sortedData = [...data];
  const sort = sortingState[0];
  if (!sort || data.length === 0) {
    return sortedData;
  }

  const sampleValue = data[0]?.[sort.id];
  const order: SortOrderDirection = sort.desc ? 'desc' : 'asc';
  const sortArgs: SortByPropArgs<TData> = { prop: sort.id as keyof TData, order };

  let sortFn: (a: TData, b: TData) => number;
  if (typeof sampleValue === 'number') {
    sortFn = sortByNumericProp(sortArgs);
  } else if (
    sampleValue instanceof Date ||
    (typeof sampleValue !== 'undefined' &&
      !Number.isNaN(new Date(sampleValue as string | number).getTime()))
  ) {
    sortFn = sortByDateProp(sortArgs);
  } else {
    sortFn = sortAlphabeticallyByProp(sortArgs);
  }

  return sortedData.sort(sortFn);
}
