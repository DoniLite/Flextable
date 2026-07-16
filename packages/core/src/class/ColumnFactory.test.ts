import { describe, expect, test } from 'bun:test';
import type { TranslateFn } from '../types/i18n';
import { ColumnFactory } from './ColumnFactory';

interface User {
  id: string;
  name: string;
  title: string;
  description: string;
  avatarUrl: string | null;
  status: 'active' | 'inactive';
  tags: Array<string>;
  updatedAt: string;
}

const t: TranslateFn = (key, options) =>
  options ? `${key}:${JSON.stringify(options)}` : key;

function makeFactory() {
  return new ColumnFactory<User>(t);
}

describe('ColumnFactory.select', () => {
  test('produces a select-kind config with translated labels', () => {
    const column = makeFactory().select();
    expect(column).toEqual({
      kind: 'select',
      id: 'select',
      selectAllLabel: 'common.selectAll',
      selectRowLabel: 'common.checkboxLabel',
    });
  });

  test('carries through an optional className and testId', () => {
    const column = makeFactory().select({
      className: 'sticky left-0',
      testId: 'select-col',
    });
    expect(column.className).toBe('sticky left-0');
    expect(column.testId).toBe('select-col');
  });
});

describe('ColumnFactory.avatar', () => {
  test('applies defaults for header key and testId, defaults getImage to the accessor', () => {
    const column = makeFactory().avatar({
      accessorKey: 'avatarUrl',
      getName: (u) => u.name,
    });
    expect(column.kind).toBe('avatar');
    expect(column.headerLabel).toBe('common.avatar');
    expect(column.testId).toBe('table-column-avatarUrl');
    expect(column.getImage({ avatarUrl: 'x.png' } as User)).toBe('x.png');
  });

  test('honors an explicit getImage override', () => {
    const column = makeFactory().avatar({
      accessorKey: 'avatarUrl',
      getName: (u) => u.name,
      getImage: () => 'override.png',
    });
    expect(column.getImage({} as User)).toBe('override.png');
  });
});

describe('ColumnFactory.name', () => {
  test('resolves the default "common.name" translation when no headerKey is given', () => {
    const column = makeFactory().name({ accessorKey: 'name', getTitle: (u) => u.name });
    expect(column.id).toBe('common.name');
    expect(column.hasDescription).toBe(true);
  });

  test('uses a custom headerKey for both id and the rendered headerLabel', () => {
    const column = makeFactory().name({
      accessorKey: 'name',
      headerKey: 'users.name',
      getTitle: (u) => u.name,
    });
    expect(column.id).toBe('users.name');
    expect(column.headerLabel).toBe('users.name');
  });
});

describe('ColumnFactory.text', () => {
  test('defaults fallbackValue from factory defaults', () => {
    const column = makeFactory().text({ accessorKey: 'title', headerKey: 'users.title' });
    expect(column.fallbackValue).toBe('N/A');
  });

  test('honors a factory-level fallbackValue default', () => {
    const factory = new ColumnFactory<User>(t, { fallbackValue: '—' });
    const column = factory.text({ accessorKey: 'title', headerKey: 'users.title' });
    expect(column.fallbackValue).toBe('—');
  });

  test('carries through an explicit getValue', () => {
    const getValue = (u: User) => u.title.toUpperCase();
    const column = makeFactory().text({
      accessorKey: 'title',
      headerKey: 'users.title',
      getValue,
    });
    expect(column.getValue).toBe(getValue);
  });
});

describe('ColumnFactory.date / updated', () => {
  const formatDate = (v: string | Date) => String(v);

  test('date() requires an explicit formatDate and accessorKey', () => {
    const column = makeFactory().date({
      accessorKey: 'updatedAt',
      headerKey: 'common.date',
      formatDate,
    });
    expect(column.formatDate).toBe(formatDate);
    expect(column.testId).toBe('table-column-updatedAt');
  });

  test('updated() defaults accessorKey to updatedAt and a fixed testId', () => {
    const column = makeFactory().updated({ formatDate });
    expect(column.accessorKey).toBe('updatedAt');
    expect(column.testId).toBe('table-column-updatedAt');
    expect(column.headerLabel).toBe('common.modificationDate');
  });
});

describe('ColumnFactory.count', () => {
  test('builds a count column with a translated header', () => {
    const column = makeFactory().count({
      accessorKey: 'tags',
      headerKey: 'users.tagCount',
    });
    expect(column.headerLabel).toBe('users.tagCount');
    expect(column.accessorKey).toBe('tags');
  });
});

describe('ColumnFactory.badge', () => {
  test('widens the TVariant generic to a plain string in the stored config', () => {
    const column = makeFactory().badge<'active' | 'inactive'>({
      accessorKey: 'status',
      headerKey: 'users.status',
      getVariant: (u) => u.status,
    });
    const variant: string = column.getVariant?.({ status: 'active' } as User) ?? '';
    expect(variant).toBe('active');
  });

  test('defaults fallbackValue like text columns', () => {
    const column = makeFactory().badge({
      accessorKey: 'status',
      headerKey: 'users.status',
    });
    expect(column.fallbackValue).toBe('N/A');
  });
});

describe('ColumnFactory.actions', () => {
  test('defaults shouldShowTrashIcon to true', () => {
    const column = makeFactory().actions({ onDelete: () => {}, onEdit: () => {} });
    expect(column.shouldShowTrashIcon).toBe(true);
    expect(column.id).toBe('actions');
  });

  test('carries through custom actions and edit/delete guards', () => {
    const customActions = [{ label: 'Archive', onClick: () => {} }];
    const column = makeFactory().actions({
      onDelete: () => {},
      onEdit: () => {},
      canDelete: () => false,
      customActions,
    });
    expect(column.customActions).toBe(customActions);
    expect(column.canDelete?.({} as User)).toBe(false);
  });

  test('carries through an optional className and testId', () => {
    const column = makeFactory().actions({
      onDelete: () => {},
      onEdit: () => {},
      className: 'sticky right-0',
      testId: 'actions-col',
    });
    expect(column.className).toBe('sticky right-0');
    expect(column.testId).toBe('actions-col');
  });
});

describe('ColumnFactory.expandRow', () => {
  test('produces the expand-row config with a translated header', () => {
    const column = makeFactory().expandRow();
    expect(column).toEqual({
      kind: 'expandRow',
      id: 'expand',
      headerLabel: 'common.details',
    });
  });

  test('carries through an optional className and testId', () => {
    const column = makeFactory().expandRow({ className: '-ml-4', testId: 'expand-col' });
    expect(column.className).toBe('-ml-4');
    expect(column.testId).toBe('expand-col');
  });
});

describe('ColumnFactory custom column plugin', () => {
  test('throws when calling custom() for an unregistered kind', () => {
    const factory = makeFactory();
    expect(() => factory.custom('currency', { amount: 10 })).toThrow(
      /no column type registered/,
    );
  });

  test('registerColumnType + custom() resolves options through the registered builder', () => {
    const factory = makeFactory();
    factory.registerColumnType<{ amount: number }, { formatted: string }>(
      'currency',
      (translate, options) => ({
        formatted: `${translate('common.currency')} ${options.amount}`,
      }),
    );
    const column = factory.custom<{ formatted: string }>('currency', { amount: 42 });
    expect(column).toEqual({
      kind: 'currency',
      options: { formatted: 'common.currency 42' },
    });
  });
});
