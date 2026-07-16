// A tiny hand-rolled TranslateFn for the demo — in a real app this would be
// `useTranslation().t` (react-i18next) or `useI18n().t` (vue-i18n) instead.
const DICTIONARY: Record<string, string> = {
  'common.actions': 'Actions',
  'common.avatar': 'Avatar',
  'common.checkboxLabel': 'Select row',
  'common.columns': 'Columns',
  'common.delete': 'Delete',
  'common.details': 'Details',
  'common.edit': 'Edit',
  'common.expand': 'Expand',
  'common.first': 'First',
  'common.last': 'Last',
  'common.modificationDate': 'Updated',
  'common.name': 'Name',
  'common.next': 'Next',
  'common.noResult': 'No results.',
  'common.previous': 'Previous',
  'common.search': 'Search',
  'common.selectAll': 'Select all rows',
  'common.showLess': 'Show less',
  'common.showMore': 'Show more',
  'common.table.of': 'of',
  'common.table.lines_per_page': 'Rows per page',
  'common.table.lines_to_all': 'All',
  'common.table.page': 'Page',
  'user.role': 'Role',
  'user.status': 'Status',
  'user.createdAt': 'Joined',
  'user.logins': 'Logins',
};

export function demoT(key: string): string {
  return DICTIONARY[key] ?? key;
}
