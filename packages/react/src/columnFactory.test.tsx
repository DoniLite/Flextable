import { afterEach, describe, expect, test } from 'bun:test';
import type { TranslateFn } from '@flextable/core';
import { ColumnFactory } from '@flextable/core';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { toReactColumnDef } from './columnFactory';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

interface User {
  id: string;
  name: string;
  title: string;
  description: string;
  avatarUrl: string | null;
  status: 'active' | 'inactive';
  tags: Array<string>;
  tagCount: number;
  updatedAt: string;
}

const t: TranslateFn = (key) => key;
const factory = new ColumnFactory<User>(t);

const user: User = {
  id: 'u1',
  name: 'Ada Lovelace',
  title: 'Ada Lovelace',
  description: 'Mathematician',
  avatarUrl: null,
  status: 'active',
  tags: ['math', 'computing'],
  tagCount: 2,
  updatedAt: '2024-05-01',
};

function makeRow(original: User, overrides: Partial<Row<User>> = {}): Row<User> {
  return {
    original,
    getIsSelected: () => false,
    toggleSelected: () => {},
    getValue: (key: string) => (original as unknown as Record<string, unknown>)[key],
    toggleExpanded: () => {},
    getIsExpanded: () => false,
    ...overrides,
  } as unknown as Row<User>;
}

function renderCell(column: ColumnDef<User, unknown>, row: Row<User>) {
  const CellRenderer = column.cell as (ctx: { row: Row<User> }) => React.ReactNode;
  return render(CellRenderer({ row }));
}

describe('toReactColumnDef — select', () => {
  test('header checkbox toggles select-all, cell checkbox toggles the row', () => {
    const column = toReactColumnDef(factory.select(), { t });
    let allToggled = false;
    const table = {
      getIsAllPageRowsSelected: () => false,
      toggleAllRowsSelected: () => {
        allToggled = true;
      },
    } as unknown as Table<User>;

    const HeaderRenderer = column.header as (ctx: {
      table: Table<User>;
    }) => React.ReactNode;
    const { getByRole } = render(HeaderRenderer({ table }));
    fireEvent.click(getByRole('checkbox'));
    expect(allToggled).toBe(true);
  });

  test('merges a caller-supplied className/testId onto the cell checkbox', () => {
    const column = toReactColumnDef(
      factory.select({ className: 'my-select-col', testId: 'select-col' }),
      { t },
    );
    const { getByTestId } = renderCell(column, makeRow(user));
    const checkbox = getByTestId('select-col');
    expect(checkbox.className).toContain('my-select-col');
  });
});

describe('toReactColumnDef — avatar', () => {
  test('renders the entity name as initials fallback', () => {
    const column = toReactColumnDef(
      factory.avatar({ accessorKey: 'avatarUrl', getName: (u) => u.name }),
      { t },
    );
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('AL')).toBeDefined();
  });
});

describe('toReactColumnDef — name', () => {
  test('renders title/description via EntityTitle by default', () => {
    const column = toReactColumnDef(
      factory.name({
        accessorKey: 'name',
        getTitle: (u) => u.name,
        getDescription: (u) => u.description,
      }),
      { t },
    );
    const { getByTestId } = renderCell(column, makeRow(user));
    expect(getByTestId('entity-title').textContent).toBe('Ada Lovelace');
    expect(getByTestId('entity-description').textContent).toBe('Mathematician');
  });

  test('renders a clickable title button when onTitleClick is provided', () => {
    let clickedId: string | undefined;
    const column = toReactColumnDef(
      factory.name({
        accessorKey: 'name',
        getTitle: (u) => u.name,
        onTitleClick: (u) => {
          clickedId = u.id;
        },
      }),
      { t },
    );
    const { getByText } = renderCell(column, makeRow(user));
    fireEvent.click(getByText('Ada Lovelace'));
    expect(clickedId).toBe('u1');
  });
});

describe('toReactColumnDef — text', () => {
  test('falls back to row.getValue + fallbackValue when getValue is absent', () => {
    const column = toReactColumnDef(
      factory.text({ accessorKey: 'title', headerKey: 'users.title' }),
      { t },
    );
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('Ada Lovelace')).toBeDefined();
  });

  test('resolves translationPrefix.value through t()', () => {
    const translate: TranslateFn = (key) => (key === 'status.active' ? 'Active!' : key);
    const column = toReactColumnDef(
      factory.text({
        accessorKey: 'status',
        headerKey: 'users.status',
        translationPrefix: 'status',
      }),
      { t: translate },
    );
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('Active!')).toBeDefined();
  });
});

describe('toReactColumnDef — date', () => {
  test('formats the accessor value with formatDate', () => {
    const column = toReactColumnDef(
      factory.date({
        accessorKey: 'updatedAt',
        headerKey: 'common.date',
        formatDate: (v) => `formatted:${v}`,
      }),
      { t },
    );
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('formatted:2024-05-01')).toBeDefined();
  });
});

describe('toReactColumnDef — count', () => {
  test('renders the array length value', () => {
    const column = toReactColumnDef(
      factory.count({ accessorKey: 'tagCount', headerKey: 'users.tagCount' }),
      { t },
    );
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('2')).toBeDefined();
  });
});

describe('toReactColumnDef — badge', () => {
  test('renders the label from getLabel, falling back to the raw value', () => {
    const column = toReactColumnDef(
      factory.badge({ accessorKey: 'status', headerKey: 'users.status' }),
      { t },
    );
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('active')).toBeDefined();
  });
});

describe('toReactColumnDef — actions', () => {
  test('bulk-delete header button appears only with a selection and calls onDelete', () => {
    let deletedIds: Array<string> | undefined;
    const column = toReactColumnDef(
      factory.actions({
        onDelete: (ids) => {
          deletedIds = ids;
        },
        onEdit: () => {},
      }),
      { t },
    );

    const tableNoSelection = {
      getSelectedRowModel: () => ({ rows: [] }),
    } as unknown as Table<User>;
    const HeaderRenderer = column.header as (ctx: {
      table: Table<User>;
    }) => React.ReactNode;
    expect(HeaderRenderer({ table: tableNoSelection })).toBeNull();

    const tableWithSelection = {
      getSelectedRowModel: () => ({ rows: [{ original: user }] }),
      resetRowSelection: () => {},
    } as unknown as Table<User>;
    const { getByRole } = render(HeaderRenderer({ table: tableWithSelection }));
    fireEvent.click(getByRole('button'));
    expect(deletedIds).toEqual(['u1']);
  });

  test('row actions menu invokes onEdit through the default EntityActionsMenu', async () => {
    let editedId: string | undefined;
    const column = toReactColumnDef(
      factory.actions({
        onDelete: () => {},
        onEdit: (u) => {
          editedId = u.id;
        },
      }),
      { t },
    );
    const { getByTestId, findByTestId } = renderCell(column, makeRow(user));
    const trigger = getByTestId('actions-dropdown');
    fireEvent.pointerDown(trigger, { button: 0, pointerId: 1 });
    fireEvent.pointerUp(trigger, { button: 0, pointerId: 1 });
    fireEvent.click(trigger);
    const editItem = await findByTestId('edit-menu-item');
    fireEvent.click(editItem);
    expect(editedId).toBe('u1');
  });

  test('merges a caller-supplied className/testId onto the cell wrapper', () => {
    const column = toReactColumnDef(
      factory.actions({
        onDelete: () => {},
        onEdit: () => {},
        className: 'my-actions-col',
        testId: 'actions-col',
      }),
      { t },
    );
    const { getByTestId } = renderCell(column, makeRow(user));
    expect(getByTestId('actions-col').className).toContain('my-actions-col');
  });
});

describe('toReactColumnDef — expandRow', () => {
  test('toggles row expansion when clicked', () => {
    let expandCalls = 0;
    const column = toReactColumnDef(factory.expandRow(), { t });
    const row = makeRow(user, {
      toggleExpanded: () => {
        expandCalls += 1;
      },
    });
    const { getByText } = renderCell(column, row);
    fireEvent.click(getByText('common.expand', { exact: false }));
    expect(expandCalls).toBe(1);
  });

  test('merges a caller-supplied className/testId onto the toggle button', () => {
    const column = toReactColumnDef(
      factory.expandRow({ className: 'my-expand-col', testId: 'expand-col' }),
      { t },
    );
    const { getByTestId } = renderCell(column, makeRow(user));
    expect(getByTestId('expand-col').className).toContain('my-expand-col');
  });
});

describe('toReactColumnDef — custom kind', () => {
  test('throws when no customRenderers entry matches the registered kind', () => {
    factory.registerColumnType('currency', (_t, options: { amount: number }) => options);
    const config = factory.custom('currency', { amount: 10 });
    expect(() => toReactColumnDef(config, { t })).toThrow(/no renderer registered/);
  });

  test('delegates to the matching customRenderers entry', () => {
    factory.registerColumnType('currency', (_t, options: { amount: number }) => options);
    const config = factory.custom<{ amount: number }>('currency', { amount: 10 });
    const column = toReactColumnDef(config, {
      t,
      customRenderers: {
        currency: (opts) => () => <span>${(opts as { amount: number }).amount}</span>,
      },
    });
    const { getByText } = renderCell(column, makeRow(user));
    expect(getByText('$10')).toBeDefined();
  });
});
