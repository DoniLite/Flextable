/**
 * Structural override points for `FlexTable`'s own layout — the "order
 * layers" that wrap the table itself (as opposed to per-column `className`,
 * see `ColumnFactory`). Every field is additive: it's merged on top of the
 * built-in classes via `cn()`/tailwind-merge, never a full replacement, so
 * the table keeps its default appearance unless you specifically override a
 * layer.
 */
export interface FlexTableClassNames {
  /** The outermost wrapper. */
  container?: string;
  /** The row above the table reserved for the `assets` slot. */
  assets?: string;
  /** The bordered card wrapping the toolbar, table and pagination. */
  card?: string;
  /** `TableToolbar`'s wrapper (search + column-visibility menu). */
  toolbar?: string;
  /** `TableContent`'s `<table>` wrapper. */
  content?: string;
  /** `TablePagination`'s wrapper. */
  pagination?: string;
}
