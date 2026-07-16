import { describe, expect, test } from 'bun:test';
import type { TranslateFn } from '@flextable/core';
import { ColumnFactory } from '@flextable/core';
import type { ColumnDef, Row, Table } from '@tanstack/vue-table';
import { mount } from '@vue/test-utils';
import type { VNode } from 'vue';
import { defineComponent, h } from 'vue';
import { toVueColumnDef } from './columnFactory';

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
  const CellRenderer = column.cell as (ctx: { row: Row<User> }) => VNode;
  return mount(defineComponent({ render: () => CellRenderer({ row }) }), {
    attachTo: document.body,
  });
}

function renderHeader(column: ColumnDef<User, unknown>, table: Table<User>) {
  const HeaderRenderer = column.header as (ctx: { table: Table<User> }) => VNode | null;
  return mount(defineComponent({ render: () => HeaderRenderer({ table }) ?? h('div') }), {
    attachTo: document.body,
  });
}

describe('toVueColumnDef — select', () => {
  test('header checkbox toggles select-all, cell checkbox toggles the row', async () => {
    const column = toVueColumnDef(factory.select(), { t });
    let allToggled = false;
    const table = {
      getIsAllPageRowsSelected: () => false,
      toggleAllRowsSelected: () => {
        allToggled = true;
      },
    } as unknown as Table<User>;

    const wrapper = renderHeader(column, table);
    await wrapper.get('button').trigger('click');
    expect(allToggled).toBe(true);
  });

  test('merges a caller-supplied className/testId onto the cell checkbox', () => {
    const column = toVueColumnDef(
      factory.select({ className: 'my-select-col', testId: 'select-col' }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    const checkbox = wrapper.get('[data-testid="select-col"]');
    expect(checkbox.classes()).toContain('my-select-col');
  });
});

describe('toVueColumnDef — avatar', () => {
  test('renders the entity name as initials fallback', () => {
    const column = toVueColumnDef(
      factory.avatar({ accessorKey: 'avatarUrl', getName: (u) => u.name }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('AL');
  });
});

describe('toVueColumnDef — name', () => {
  test('renders title/description via EntityTitle by default', () => {
    const column = toVueColumnDef(
      factory.name({
        accessorKey: 'name',
        getTitle: (u) => u.name,
        getDescription: (u) => u.description,
      }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.get('[data-testid="entity-title"]').text()).toBe('Ada Lovelace');
    expect(wrapper.get('[data-testid="entity-description"]').text()).toBe(
      'Mathematician',
    );
  });

  test('renders a clickable title button when onTitleClick is provided', async () => {
    let clickedId: string | undefined;
    const column = toVueColumnDef(
      factory.name({
        accessorKey: 'name',
        getTitle: (u) => u.name,
        onTitleClick: (u) => {
          clickedId = u.id;
        },
      }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    await wrapper.get('button').trigger('click');
    expect(clickedId).toBe('u1');
  });
});

describe('toVueColumnDef — text', () => {
  test('falls back to row.getValue + fallbackValue when getValue is absent', () => {
    const column = toVueColumnDef(
      factory.text({ accessorKey: 'title', headerKey: 'users.title' }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('Ada Lovelace');
  });

  test('resolves translationPrefix.value through t()', () => {
    const translate: TranslateFn = (key) => (key === 'status.active' ? 'Active!' : key);
    const column = toVueColumnDef(
      factory.text({
        accessorKey: 'status',
        headerKey: 'users.status',
        translationPrefix: 'status',
      }),
      { t: translate },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('Active!');
  });
});

describe('toVueColumnDef — date', () => {
  test('formats the accessor value with formatDate', () => {
    const column = toVueColumnDef(
      factory.date({
        accessorKey: 'updatedAt',
        headerKey: 'common.date',
        formatDate: (v) => `formatted:${v}`,
      }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('formatted:2024-05-01');
  });
});

describe('toVueColumnDef — count', () => {
  test('renders the accessor value', () => {
    const column = toVueColumnDef(
      factory.count({ accessorKey: 'tagCount', headerKey: 'users.tagCount' }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('2');
  });
});

describe('toVueColumnDef — badge', () => {
  test('renders the label from getLabel, falling back to the raw value', () => {
    const column = toVueColumnDef(
      factory.badge({ accessorKey: 'status', headerKey: 'users.status' }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('active');
  });
});

describe('toVueColumnDef — actions', () => {
  test('bulk-delete header button appears only with a selection and calls onDelete', async () => {
    let deletedIds: Array<string> | undefined;
    const column = toVueColumnDef(
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
    const HeaderRenderer = column.header as (ctx: { table: Table<User> }) => VNode | null;
    expect(HeaderRenderer({ table: tableNoSelection })).toBeNull();

    const tableWithSelection = {
      getSelectedRowModel: () => ({ rows: [{ original: user }] }),
      resetRowSelection: () => {},
    } as unknown as Table<User>;
    const wrapper = renderHeader(column, tableWithSelection);
    await wrapper.get('[data-testid="bulk-delete-button"]').trigger('click');
    expect(deletedIds).toEqual(['u1']);
  });

  test('row actions menu invokes onEdit through the default EntityActionsMenu', async () => {
    let editedId: string | undefined;
    const column = toVueColumnDef(
      factory.actions({
        onDelete: () => {},
        onEdit: (u) => {
          editedId = u.id;
        },
      }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    await wrapper.get('[data-testid="actions-dropdown"]').trigger('click');
    await document.querySelector<HTMLElement>('[data-testid="edit-menu-item"]')?.click();
    expect(editedId).toBe('u1');

    wrapper.unmount();
  });

  test('merges a caller-supplied className/testId onto the cell wrapper', () => {
    const column = toVueColumnDef(
      factory.actions({
        onDelete: () => {},
        onEdit: () => {},
        className: 'my-actions-col',
        testId: 'actions-col',
      }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.get('[data-testid="actions-col"]').classes()).toContain(
      'my-actions-col',
    );
  });
});

describe('toVueColumnDef — expandRow', () => {
  test('toggles row expansion when clicked', async () => {
    let expandCalls = 0;
    const column = toVueColumnDef(factory.expandRow(), { t });
    const row = makeRow(user, {
      toggleExpanded: () => {
        expandCalls += 1;
      },
    });
    const wrapper = renderCell(column, row);
    await wrapper.get('button').trigger('click');
    expect(expandCalls).toBe(1);
  });

  test('merges a caller-supplied className/testId onto the toggle button', () => {
    const column = toVueColumnDef(
      factory.expandRow({ className: 'my-expand-col', testId: 'expand-col' }),
      { t },
    );
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.get('[data-testid="expand-col"]').classes()).toContain(
      'my-expand-col',
    );
  });
});

describe('toVueColumnDef — custom kind', () => {
  test('throws when no customRenderers entry matches the registered kind', () => {
    factory.registerColumnType('currency', (_t, options: { amount: number }) => options);
    const config = factory.custom('currency', { amount: 10 });
    expect(() => toVueColumnDef(config, { t })).toThrow(/no renderer registered/);
  });

  test('delegates to the matching customRenderers entry', () => {
    factory.registerColumnType('currency', (_t, options: { amount: number }) => options);
    const config = factory.custom<{ amount: number }>('currency', { amount: 10 });
    const column = toVueColumnDef(config, {
      t,
      customRenderers: {
        currency: (opts) => () => h('span', `$${(opts as { amount: number }).amount}`),
      },
    });
    const wrapper = renderCell(column, makeRow(user));
    expect(wrapper.text()).toBe('$10');
  });
});
