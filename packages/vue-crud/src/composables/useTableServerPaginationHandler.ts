import type { PaginatedResponse, PaginationQuery } from '@flextable/core';
import { PAGINATION_DEFAULT_PAGE_SIZE } from '@flextable/core';
import { computed, ref, shallowRef } from 'vue';

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
 * Standalone composable handling pagination state and CRUD list bookkeeping
 * for a server-backed store. Generalized from the original app's composable
 * — pagination types now come from `@flextable/core` instead of an
 * app-owned interfaces module, and every Nuxt auto-import is explicit.
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

  // shallowRef, not ref: T is a generic parameter, and Vue's deep ref-unwrapping
  // (UnwrapRefSimple<T>) can't be proven identical to T at the type level for
  // an unresolved generic. These lists are always replaced wholesale anyway,
  // never mutated in place, so shallow reactivity is also the right semantics.
  const items = shallowRef<Array<T>>([]);
  const allItems = shallowRef<Array<T>>([]);
  const pagination = ref<
    Pick<PaginatedResponse<T>, 'itemCount' | 'page' | 'pageSize' | 'pageCount'>
  >({
    itemCount: 0,
    page: 1,
    pageSize: initialPageSize,
    pageCount: 0,
  });
  const query = shallowRef<Q>({
    page: 1,
    pageSize: initialPageSize,
    ...initialQuery,
  } as Q);

  function addUniqueToAllItems(itemsToAdd: Array<T>) {
    allItems.value = [...itemsToAdd, ...allItems.value].filter(
      (item, index, self) =>
        self.findIndex((candidate) => candidate.id === item.id) === index,
    );
  }

  async function fetchData(newQuery: Partial<Q> = {}): Promise<PaginatedResponse<T>> {
    const mergedQuery = { ...query.value, ...newQuery } as Q;
    query.value = mergedQuery;

    const response = await refetchFunction(mergedQuery);

    items.value = response.items;
    pagination.value = {
      itemCount: response.itemCount,
      page: response.page,
      pageSize: response.pageSize,
      pageCount: response.pageCount,
    };

    return response;
  }

  async function fetchAllData(
    newQuery: Partial<Q> = {},
    opts: FetchAllDataOptions = { force: true },
  ): Promise<Array<T>> {
    const { filters, ...restQuery } = newQuery;
    if (opts.force && fetchAll) {
      const response = await fetchAll({
        ...(restQuery as Q),
        ...(filters as unknown as Record<string, unknown>),
      } as Q);
      addUniqueToAllItems(response);
      return response;
    }
    return allItems.value;
  }

  function handlePostCreate(newItem: T) {
    const { pageSize } = pagination.value;
    const nextItems = [newItem, ...items.value];
    items.value = nextItems.length > pageSize ? nextItems.slice(0, pageSize) : nextItems;

    const nextAllItems = [newItem, ...allItems.value];
    allItems.value =
      nextAllItems.length > pageSize ? nextAllItems.slice(0, pageSize) : nextAllItems;

    pagination.value = {
      ...pagination.value,
      itemCount: pagination.value.itemCount + 1,
      pageCount: Math.ceil((pagination.value.itemCount + 1) / pagination.value.pageSize),
    };
  }

  function handlePostUpdate(updatedItem: T) {
    const replaceInList = (list: Array<T>) => {
      const index = list.findIndex((item) => item.id === updatedItem.id);
      if (index === -1) return list;
      const next = [...list];
      next[index] = { ...updatedItem };
      return next;
    };
    items.value = replaceInList(items.value);
    allItems.value = replaceInList(allItems.value);
  }

  function handlePostUpdatePartial(
    id: T['id'],
    partialUpdatedItem: Partial<T>,
  ): Partial<T> {
    const patchInList = (list: Array<T>) => {
      const index = list.findIndex((item) => item.id === id);
      if (index === -1) return list;
      const next = [...list];
      next[index] = { ...next[index], ...partialUpdatedItem } as T;
      return next;
    };
    items.value = patchInList(items.value);
    allItems.value = patchInList(allItems.value);
    return partialUpdatedItem;
  }

  function removeItemsFromList(itemIds: Array<T['id']>) {
    items.value = items.value.filter((item) => !itemIds.includes(item.id));
    allItems.value = allItems.value.filter((item) => !itemIds.includes(item.id));
  }

  async function handlePostDelete(deletedCount = 1) {
    const newItemCount = Math.max(0, pagination.value.itemCount - deletedCount);
    pagination.value = {
      ...pagination.value,
      itemCount: newItemCount,
      pageCount: Math.ceil(newItemCount / pagination.value.pageSize),
    };

    if (items.value.length === 0 && pagination.value.page > 1) {
      const previousPage = pagination.value.page - 1;
      pagination.value = { ...pagination.value, page: previousPage };
      await fetchData({ page: previousPage } as Partial<Q>);
    } else if (items.value.length === 0 && pagination.value.page === 1) {
      await fetchData({ page: 1 } as Partial<Q>);
    }
  }

  async function handleBulkDelete(deletedItemIds: Array<T['id']>) {
    removeItemsFromList(deletedItemIds);
    await handlePostDelete(deletedItemIds.length);
  }

  async function goToPage(page: number) {
    await fetchData({ page } as Partial<Q>);
  }

  async function updatePageSize(pageSize: number) {
    await fetchData({ page: 1, pageSize } as Partial<Q>);
  }

  async function updateFilters(filters: Partial<Q>) {
    await fetchData({ page: 1, ...filters } as Partial<Q>);
  }

  function resetFilters() {
    items.value = [];
    pagination.value = { itemCount: 0, page: 1, pageSize: initialPageSize, pageCount: 0 };
    query.value = { page: 1, pageSize: initialPageSize, ...initialQuery } as Q;
  }

  return {
    items: computed(() => items.value),
    allItems: computed(() => allItems.value),
    pagination: computed(() => pagination.value),
    query: computed(() => query.value),

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
    setQuery: (newQuery: Q) => {
      query.value = newQuery;
    },
  };
}
