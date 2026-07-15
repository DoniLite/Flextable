export const PAGINATION_DEFAULT_PAGE_SIZE = 10

//TODO!: remove 1, 2 and 5 before production
export const PAGINATION_PAGE_SIZE_OPTIONS = [1, 2, 5, 10, 20, 50, 100, 500]

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

// Enhanced pagination query interface
export interface PaginationQuery {
  page?: number
  pageSize?: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
  includeDeleted?: boolean
  populateChildren?: boolean
  filters?: Record<string, string | number | boolean | string[] | undefined>
}

export interface PaginatedResponse<T> {
  items: T[]
  itemCount: number
  page: number
  pageSize: number
  pageCount: number
}

/**
 * Simulates pagination on a simple array.
 */
export function paginatedArray<T>(data: T[], page: number, pageSize: number): PaginatedResponse<T> {
  const totalItems = data.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const items = data.slice(startIndex, endIndex)

  return {
    items,
    itemCount: totalItems,
    page,
    pageSize,
    pageCount: totalPages
  }
}
