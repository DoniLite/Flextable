/**
 * Every translation key the library's built-in "chrome" (as opposed to
 * column content, whose keys are always caller-supplied) resolves through
 * `t()`. Inherited verbatim from the original source apps' `common.*`
 * namespace as defaults — override any subset to match your own i18n
 * resource layout instead of having to mirror this exact namespace.
 */
export interface FlexTableKeys {
  selectAll: string;
  checkboxLabel: string;
  avatar: string;
  name: string;
  modificationDate: string;
  details: string;
  actions: string;
  edit: string;
  delete: string;
  expand: string;
  columns: string;
  first: string;
  last: string;
  next: string;
  previous: string;
  page: string;
  linesPerPage: string;
  linesToAll: string;
  search: string;
  showLess: string;
  showMore: string;
  noResult: string;
  of: string;
}

export const DEFAULT_FLEXTABLE_KEYS: FlexTableKeys = {
  selectAll: 'common.selectAll',
  checkboxLabel: 'common.checkboxLabel',
  avatar: 'common.avatar',
  name: 'common.name',
  modificationDate: 'common.modificationDate',
  details: 'common.details',
  actions: 'common.actions',
  edit: 'common.edit',
  delete: 'common.delete',
  expand: 'common.expand',
  columns: 'common.columns',
  first: 'common.first',
  last: 'common.last',
  next: 'common.next',
  previous: 'common.previous',
  page: 'common.table.page',
  linesPerPage: 'common.table.lines_per_page',
  linesToAll: 'common.table.lines_to_all',
  search: 'common.search',
  showLess: 'common.showLess',
  showMore: 'common.showMore',
  noResult: 'common.noResult',
  of: 'common.table.of',
};

export function resolveFlexTableKeys(overrides?: Partial<FlexTableKeys>): FlexTableKeys {
  return { ...DEFAULT_FLEXTABLE_KEYS, ...overrides };
}
