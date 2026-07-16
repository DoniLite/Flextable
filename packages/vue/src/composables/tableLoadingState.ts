import type { ComputedRef, InjectionKey } from 'vue';

/**
 * Typed provide/inject key for the table's loading state — FlexTable.vue
 * provides it (defaulting to `false` unless a `loading` prop is passed);
 * TableSearchWithButton/TablePagination inject it to disable interaction
 * while a server-side fetch is in flight. Unlike the original app's plain
 * string key, this is a Symbol so mismatched provide/inject can't silently
 * collide, and consumers get a typed default without needing a wrapping
 * provider component at all.
 */
export const TABLE_LOADING_STATE_KEY: InjectionKey<ComputedRef<boolean>> = Symbol(
  'flextable:table-loading-state',
);
