/* eslint-disable @typescript-eslint/naming-convention */
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  PaginatedResponse,
  PaginationQuery,
} from '@/lib/interfaces/pagination';
import { PAGINATION_DEFAULT_PAGE_SIZE } from '@/lib/interfaces/pagination';

export interface TableServerPaginationHandlerOptions<
  T,
  Q extends PaginationQuery = PaginationQuery,
> {
  initialPageSize?: number;
  initialQuery?: Partial<Q>;
  refetchFunction: (query: Q) => Promise<PaginatedResponse<T>>;
  fetchAll?: (query: Q) => Promise<Array<T>>;
}
export interface FetchAllDataOptions {
  force?: boolean;
}

/**
 * Independent composable for handling pagination state and CRUD operations
 * Manages its own refs and provides computed values for stores to use
 */
export function useTableServerPaginationHandler<
  T extends { id?: string },
  Q extends PaginationQuery = PaginationQuery,
>(options: TableServerPaginationHandlerOptions<T, Q>) {
  const {
    initialPageSize = PAGINATION_DEFAULT_PAGE_SIZE,
    initialQuery = {},
    refetchFunction,
    fetchAll,
  } = options;

  // Internal refs managed by this composable
  const [items, setItems] = useState<Array<T>>([]);
  const itemsRef = useRef<Array<T>>(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const [allItems, setAllItems] = useState<Array<T>>([]);
  const allItemsRef = useRef<Array<T>>(allItems);
  useEffect(() => {
    allItemsRef.current = allItems;
  }, [allItems]);

  const [pagination, setPagination] = useState<
    Pick<PaginatedResponse<T>, 'itemCount' | 'page' | 'pageSize' | 'pageCount'>
  >({
    itemCount: 0,
    page: 1,
    pageSize: initialPageSize,
    pageCount: 0,
  });
  const paginationRef = useRef(pagination);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  const [query, setQuery] = useState<Q>({
    page: 1,
    pageSize: initialPageSize,
    ...initialQuery,
  } as Q);
  const queryRef = useRef<Q>(query);

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const _setAllItems = useCallback((itemsToAdd: Array<T>) => {
    setAllItems((prev) =>
      [...itemsToAdd, ...prev].filter(
        (x: T, i, self: Array<T>) =>
          self.findIndex((item) => item.id === x.id) === i,
      ),
    );
  }, []);

  /**
   * Fetches data using the provided refetch function and updates internal state
   */
  const fetchData = useCallback(
    async (newQuery: Partial<Q> = {}): Promise<PaginatedResponse<T>> => {
      // Merge query immutably and keep ref updated
      const mergedQuery = { ...queryRef.current, ...newQuery } as Q;
      setQuery(mergedQuery);
      queryRef.current = mergedQuery;

      const response = await refetchFunction(mergedQuery);

      setItems(response.items);
      setPagination({
        itemCount: response.itemCount,
        page: response.page,
        pageSize: response.pageSize,
        pageCount: response.pageCount,
      });

      return response;
    },
    [refetchFunction],
  );

  /**
   * Fetches data using the provided refetch function and updates internal state
   */
  const fetchAllData = useCallback(
    async (
      newQuery: Partial<Q> = {},
      options: FetchAllDataOptions = { force: true },
    ): Promise<Array<T>> => {
      const { filters, ...restQuery } = newQuery;
      if (options.force && fetchAll) {
        const response = await fetchAll({
          ...(restQuery as Q),
          ...(filters as unknown as Record<string, unknown>),
        } as Q);
        _setAllItems(response);
        return response;
      }
      return allItemsRef.current;
    },
    [_setAllItems, fetchAll],
  );

  /**
   * Handles pagination state after creating or updating an item
   * Adds the item to the beginning of the list and maintains page size
   */

  const handlePostCreate = useCallback((newItem: T) => {
    setItems((prev) => {
      const next = [newItem, ...prev];
      const { pageSize } = paginationRef.current;
      return next.length > pageSize ? next.slice(0, pageSize) : next;
    });

    setAllItems((prev) => {
      const next = [newItem, ...prev];
      const { pageSize } = paginationRef.current;
      return next.length > pageSize ? next.slice(0, pageSize) : next;
    });

    setPagination((prev) => ({
      ...prev,
      itemCount: prev.itemCount + 1,
      pageCount: Math.ceil((prev.itemCount + 1) / prev.pageSize),
    }));
  }, []);

  /**
   * Handles pagination state after updating an existing item
   * Updates the item in place if it exists in the current page
   */

  const handlePostUpdate = useCallback((updatedItem: T) => {
    setItems((prev) => {
      const index = prev.findIndex((item) => item.id === updatedItem.id);
      if (index === -1) {
        return prev;
      }
      const newItems = [...prev];
      newItems[index] = {
        ...updatedItem,
      };
      return newItems;
    });

    setAllItems((prev) => {
      const index = prev.findIndex((item) => item.id === updatedItem.id);
      if (index === -1) {
        return prev;
      }
      const newItems = [...prev];
      newItems[index] = {
        ...updatedItem,
      };
      return newItems;
    });
  }, []);

  /**
   * Handles pagination state after updating an existing item
   * Updates the item partially in place if it exists in the current page
   */

  const handlePostUpdatePartial = useCallback(
    (id: T['id'], partialUpdatedItem: Partial<T>): Partial<T> => {
      setItems((prev) => {
        const index = prev.findIndex((item) => item.id === id);
        if (index === -1) {
          return prev;
        }
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], ...partialUpdatedItem } as T;
        return newItems;
      });
      setAllItems((prev) => {
        const index = prev.findIndex((item) => item.id === id);
        if (index === -1) {
          return prev;
        }
        const newItems = [...prev];
        newItems[index] = { ...newItems[index], ...partialUpdatedItem } as T;
        return newItems;
      });
      return partialUpdatedItem;
    },
    [],
  );

  /**
   * Removes specific items from the current list by ID
   */
  const removeItemsFromList = useCallback((itemIds: Array<T['id']>) => {
    setItems((prev) => prev.filter((item) => !itemIds.includes(item.id)));
    setAllItems((prev) => prev.filter((item) => !itemIds.includes(item.id)));
  }, []);

  /**
   * Handles pagination state after deleting items
   * Removes items from the list and handles page navigation if current page becomes empty
   */
  const handlePostDelete = useCallback(
    async (deletedCount = 1) => {
      // Update total count
      setPagination((prev) => {
        const newItemCount = Math.max(0, prev.itemCount - deletedCount);
        return {
          ...prev,
          itemCount: newItemCount,
          pageCount: Math.ceil(newItemCount / prev.pageSize),
        };
      });

      const currentItems = itemsRef.current;
      const currentPagination = paginationRef.current;

      // If current page is empty and not the first page, go to previous page
      if (currentItems.length === 0 && currentPagination.page > 1) {
        const previousPage = currentPagination.page - 1;
        setPagination((prev) => ({
          ...prev,
          page: previousPage,
        }));
        await fetchData({ page: previousPage } as Partial<Q>);
      } else if (currentItems.length === 0 && currentPagination.page === 1) {
        // If we're on the first page and it's empty, just refetch to ensure consistency
        await fetchData({ page: 1 } as Partial<Q>);
      }
    },
    [fetchData],
  );

  /**
   * Handles bulk delete operations
   */

  const handleBulkDelete = useCallback(
    async (deletedItemIds: Array<T['id']>) => {
      // Remove items from the current list
      removeItemsFromList(deletedItemIds);

      // Handle pagination state
      await handlePostDelete(deletedItemIds.length);
    },
    [removeItemsFromList, handlePostDelete],
  );

  /**
   * Updates the current page and refetches data
   */
  const goToPage = useCallback(
    async (page: number) => {
      await fetchData({ page } as Partial<Q>);
    },
    [fetchData],
  );

  /**
   * Updates the page size and refetches data
   */
  const updatePageSize = useCallback(
    async (pageSize: number) => {
      await fetchData({ page: 1, pageSize } as Partial<Q>);
    },
    [fetchData],
  );

  /**
   * Updates search/filter parameters and refetches data
   */
  const updateFilters = useCallback(
    async (filters: Partial<Q>) => {
      await fetchData({ page: 1, ...filters } as Partial<Q>);
    },
    [fetchData],
  );

  /**
   * Resets the state to initial values
   */
  const resetFilters = useCallback(() => {
    setItems([]);
    setPagination({
      itemCount: 0,
      page: 1,
      pageSize: initialPageSize,
      pageCount: 0,
    });
    const resetQ = {
      page: 1,
      pageSize: initialPageSize,
      ...initialQuery,
    } as Q;
    setQuery(resetQ);
    queryRef.current = resetQ;
  }, [initialPageSize, initialQuery]);

  return {
    items,
    allItems,
    pagination,
    query,

    // Actions
    fetchData,
    fetchAllData,
    handlePostCreate,
    handlePostUpdate,
    handlePostUpdatePartial,
    handlePostDelete,
    handleBulkDelete,
    removeItemsFromList,
    goToPage,
    updatePageSize,
    updateFilters,
    resetFilters,
    setQuery,
  };
}
