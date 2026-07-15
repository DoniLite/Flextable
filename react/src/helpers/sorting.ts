import type { ColumnDef, SortingFn, SortingState } from '@tanstack/react-table';

/** **********************************************************************
 * ****************************************
 * Helpers et utilitary functions for datables sorting
 * Please add comments and sources if you copied the code somewhere :)
 * ********************************************************************
 */

export type SortOrder = 'asc' | 'desc';

/**
 * Get the union type of values of an object type.
 * @template T - The object type to get the union type of its values.
 * @returns The union type of values of the object type.
 */
export type ValueOf<T> = T[keyof T];

export interface SortByPropArgs<T> {
  prop: keyof T;
  priorityProp?: keyof T;
  order?: SortOrder;
}

export function sortAlphabetically(a: string, b: string) {
  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  }
  if (a.toLowerCase() > b.toLowerCase()) {
    return 1;
  }
  return 0;
}
/**
 * A generic function to sort an array of objects by a specific property alphabetically
 * @param prop - The property of the object to sort by
 */
export function sortAlphabeticallyByProp<T>({
  prop,
  priorityProp,
  order = 'asc',
}: SortByPropArgs<T>) {
  // This function will be used by the sort algorithm
  return (a: T, b: T) => {
    // comparing the priority property
    if (!priorityProp || a[priorityProp] === b[priorityProp]) {
      // Get the lowercase values of the property to compare
      // check if the property passed is a string
      const propA = a[prop];
      const propB = b[prop];

      if (typeof propA === 'string' && typeof propB === 'string') {
        // Compare the values and return -1, 0 or 1

        const result = propA.toLowerCase().localeCompare(propB.toLowerCase());
        return order === 'asc' ? result : result * -1;
      }
      return 0;
    }
    // if priority property is different, put the priorities elements first
    return a[priorityProp] ? -1 : 1;
  };
}
/**
 * A generic function to sort an array of objects by a specific property alphabetically
 * @param prop - The property of the object to sort by
 */
export function sortByNumericProp<T>({
  prop,
  priorityProp,
  order = 'asc',
}: SortByPropArgs<T>) {
  // This function will be used by the sort algorithm
  return (a: T, b: T) => {
    // comparing the priority property
    if (!priorityProp || a[priorityProp] === b[priorityProp]) {
      // Get the lowercase values of the property to compare
      // check if the property passed is a number
      const propA = a[prop];
      const propB = b[prop];

      if (typeof propA === 'number' && typeof propB === 'number') {
        // Compare the values and return -1, 0 or 1
        let result = 0;
        if (propA < propB) {
          result = -1;
        }
        if (propA > propB) {
          result = 1;
        }
        return order === 'asc' ? result : result * -1;
      }
      return 0;
    }
    // if priority property is different, put the priorities elements first
    return a[priorityProp] ? -1 : 1;
  };
}

/**
 * A generic function to sort an array of objects by a specific date property
 * @param prop - The date property of the object to sort by
 * @param order - The order to sort the date property in, either "asc" or "desc"
 */
export function sortByDateProp<T>({
  prop,
  priorityProp,
  order = 'desc',
}: SortByPropArgs<T>) {
  // This function will be used by the sort algorithm

  return (a: T, b: T) => {
    let score = 0;
    // comparing the priority property
    if (!priorityProp || a[priorityProp] === b[priorityProp]) {
      // check if the property passed is a string
      const propA = a[prop];
      const propB = b[prop];

      if (
        (propA instanceof Date && propB instanceof Date) ||
        (typeof propA === 'string' && typeof propB === 'string') ||
        (typeof propA === 'number' && typeof propB === 'number')
      ) {
        // Get the values of the date property to compare
        const dateA = new Date(propA);
        const dateB = new Date(propB);

        if (!Number.isNaN(dateA.getTime()) && !Number.isNaN(dateB.getTime())) {
          // Compare the values and return -1, 0 or 1 based on the order
          score =
            order === 'asc'
              ? dateA.getTime() - dateB.getTime()
              : dateB.getTime() - dateA.getTime();
        }
      }
    } else {
      // if priority property is different, put the priorities elements first
      score = a[priorityProp] ? -1 : 1;
    }

    return score;
  };
}

/**
 * Get a random number between 0...length
 * @param length
 * @returns
 */
export function getRandomNumber(length = 100) {
  return Math.floor(Math.random() * length);
}

/**
 * Applies sorting to the data based on the current sorting state and column definitions.
 * Determines the appropriate sorting method (numeric, date, alphabetical) based on column config or data type.
 * @param data The data array to sort.
 * @param sortingState The current sorting state from tanstack table.
 * @param columns The column definitions array.
 * @returns A new sorted array.
 */
export function applySorting<TData extends Record<string, unknown>, TValue>(
  data: Array<TData>,
  sortingState: SortingState,
  columns: Array<ColumnDef<TData, TValue>>,
): Array<TData> {
  const sortedData = [...data];
  if (sortingState.length > 0 && data.length > 0) {
    const sort = sortingState[0];
    if (!sort) {
      return sortedData;
    }
    const column = columns.find(
      (c) =>
        ('accessorKey' in c && c.accessorKey === sort.id) || c.id === sort.id,
    );

    // Determine the sorting function based on column definition or data type inference
    let sortFn: (a: TData, b: TData) => number;

    // Check if a custom sorting function is defined in the column
    const customSortFn = column?.sortingFn;

    if (typeof customSortFn === 'function') {
      // Note: Tanstack's SortingFn expects Row objects. We'd need to wrap data items
      // or adapt the custom function signature if it expects raw data.
      // For now, we'll assume customSortFn might not be directly usable here without Rows.
      // Let's prioritize inference or specific sorting types defined in the column meta.
    }

    // Infer sorting type from the first data item's property type if no specific function
    const sampleValue = data[0]?.[sort.id];
    const sortOrder = sort.desc ? 'desc' : 'asc';
    const sortArgs: SortByPropArgs<TData> = {
      prop: sort.id as keyof TData,
      order: sortOrder,
    };

    if (typeof sampleValue === 'number') {
      sortFn = sortByNumericProp(sortArgs);
    } else if (
      sampleValue instanceof Date ||
      !Number.isNaN(new Date(sampleValue as string | number).getTime())
    ) {
      // Check if it's a Date object or a string/number parseable as a Date
      sortFn = sortByDateProp(sortArgs);
    } else {
      // Default to alphabetical sorting for strings or other types
      sortFn = sortAlphabeticallyByProp(sortArgs);
    }

    sortedData.sort(sortFn);
  }
  return sortedData;
}
