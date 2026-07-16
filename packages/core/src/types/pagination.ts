export const PAGINATION_DEFAULT_PAGE_SIZE = 10;

export const PAGINATION_PAGE_SIZE_OPTIONS: ReadonlyArray<number> = [10, 20, 50, 100];

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  includeDeleted?: boolean;
  populateChildren?: boolean;
  filters?: Record<string, string | number | boolean | Array<string> | undefined>;
}

export interface PaginatedResponse<T> {
  items: Array<T>;
  itemCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** Simulates pagination on a plain in-memory array — handy for demos/tests. */
export function paginatedArray<T>(
  data: Array<T>,
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const itemCount = data.length;
  const pageCount = Math.ceil(itemCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = data.slice(startIndex, startIndex + pageSize);

  return { items, itemCount, page, pageSize, pageCount };
}
