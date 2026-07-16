import { afterEach, describe, expect, test } from 'bun:test';
import type { TranslateFn } from '@flextable/core';
import { ColumnFactory } from '@flextable/core';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { toReactColumnDef } from './columnFactory';
import { FlexTable } from './FlexTable';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

interface User {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

const t: TranslateFn = (key) => key;
const factory = new ColumnFactory<User>(t);

const users: Array<User> = [
  { id: 'u1', name: 'Bob', status: 'active' },
  { id: 'u2', name: 'Ada', status: 'inactive' },
  { id: 'u3', name: 'Carl', status: 'active' },
];

function buildColumns() {
  return [
    toReactColumnDef(factory.select(), { t }),
    toReactColumnDef(factory.text({ accessorKey: 'name', headerKey: 'users.name' }), {
      t,
    }),
    toReactColumnDef(factory.actions({ onDelete: () => {}, onEdit: () => {} }), { t }),
  ];
}

describe('FlexTable', () => {
  test('renders one row per data item', () => {
    const { getByText } = render(
      <FlexTable columns={buildColumns()} data={users} t={t} />,
    );
    expect(getByText('Bob')).toBeDefined();
    expect(getByText('Ada')).toBeDefined();
    expect(getByText('Carl')).toBeDefined();
  });

  test('shows the no-results message for an empty dataset', () => {
    const { getByText } = render(<FlexTable columns={buildColumns()} data={[]} t={t} />);
    expect(getByText('common.noResult')).toBeDefined();
  });

  test('client-side global search filters rows down', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <FlexTable
        columns={buildColumns()}
        data={users}
        t={t}
        serverSideFiltering={false}
        searchColumns={['name']}
        useFuzzySearch={false}
      />,
    );
    const search = getByPlaceholderText('common.search') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'ada' } });
    fireEvent.keyUp(search);
    expect(getByText('Ada')).toBeDefined();
    expect(queryByText('Bob')).toBeNull();
  });

  test('onSearchChange fires on every search input change regardless of serverSideFiltering', () => {
    const seen: Array<string> = [];
    const { getByPlaceholderText } = render(
      <FlexTable
        columns={buildColumns()}
        data={users}
        t={t}
        serverSideFiltering={false}
        onSearchChange={(value) => seen.push(value)}
      />,
    );
    const search = getByPlaceholderText('common.search') as HTMLInputElement;
    fireEvent.change(search, { target: { value: 'ada' } });
    fireEvent.keyUp(search);
    expect(seen).toContain('ada');
  });

  test('a custom assets component can trigger search via handleSearchUpdate', () => {
    const seen: Array<string> = [];
    function CustomAssets({
      handleSearchUpdate,
    }: {
      handleSearchUpdate: (value: string) => void;
    }) {
      return (
        <button type="button" onClick={() => handleSearchUpdate('ada')}>
          custom-search-trigger
        </button>
      );
    }
    const { getByText, queryByText } = render(
      <FlexTable
        columns={buildColumns()}
        data={users}
        t={t}
        serverSideFiltering={false}
        searchColumns={['name']}
        useFuzzySearch={false}
        onSearchChange={(value) => seen.push(value)}
        assets={CustomAssets}
      />,
    );
    fireEvent.click(getByText('custom-search-trigger'));
    expect(seen).toContain('ada');
    expect(getByText('Ada')).toBeDefined();
    expect(queryByText('Bob')).toBeNull();
  });

  test('a custom tableFilters component can trigger search via handleSearchUpdate', () => {
    function CustomFilters({
      handleSearchUpdate,
    }: {
      handleSearchUpdate: (value: string) => void;
    }) {
      return (
        <button type="button" onClick={() => handleSearchUpdate('carl')}>
          custom-filter-search-trigger
        </button>
      );
    }
    const { getByText, queryByText } = render(
      <FlexTable
        columns={buildColumns()}
        data={users}
        t={t}
        serverSideFiltering={false}
        searchColumns={['name']}
        useFuzzySearch={false}
        tableFilters={CustomFilters}
      />,
    );
    fireEvent.click(getByText('custom-filter-search-trigger'));
    expect(getByText('Carl')).toBeDefined();
    expect(queryByText('Bob')).toBeNull();
  });

  test('client-side sorting toggles when a sortable header is clicked', () => {
    const { getByText, getAllByRole } = render(
      <FlexTable columns={buildColumns()} data={users} t={t} />,
    );
    fireEvent.click(getByText('users.name'));
    const rows = getAllByRole('row').slice(1); // drop header row
    expect(rows[0]?.textContent).toContain('Ada');
  });

  test('bulk-delete button appears once a row is selected and deletes it', () => {
    let deleted: Array<string> | undefined;
    const columns = [
      toReactColumnDef(factory.select(), { t }),
      toReactColumnDef(factory.text({ accessorKey: 'name', headerKey: 'users.name' }), {
        t,
      }),
      toReactColumnDef(
        factory.actions({
          onDelete: (ids) => {
            deleted = ids;
          },
          onEdit: () => {},
        }),
        { t },
      ),
    ];
    const { getAllByRole, getByTestId } = render(
      <FlexTable columns={columns} data={users} t={t} />,
    );
    const rowCheckboxes = getAllByRole('checkbox').slice(1); // drop select-all checkbox
    fireEvent.click(rowCheckboxes[0] as HTMLElement);
    fireEvent.click(getByTestId('bulk-delete-button'));
    expect(deleted).toEqual(['u1']);
  });

  test('column-visibility dropdown can hide a column', async () => {
    const { getByText, findByText, queryByText } = render(
      <FlexTable columns={buildColumns()} data={users} t={t} />,
    );
    const dropdownTrigger = getByText('common.columns');
    fireEvent.pointerDown(dropdownTrigger, { button: 0, pointerId: 1 });
    fireEvent.pointerUp(dropdownTrigger, { button: 0, pointerId: 1 });
    fireEvent.click(dropdownTrigger);

    const nameCheckboxItem = await findByText('name');
    fireEvent.click(nameCheckboxItem);
    expect(queryByText('Bob')).toBeNull();
  });

  test('pagination controls disable/enable appropriately for a single page of data', () => {
    const { getByTestId } = render(
      <FlexTable columns={buildColumns()} data={users} t={t} />,
    );
    expect(
      (getByTestId('pagination-previous-button') as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  test('paginates a larger client-side dataset via next/first/last controls', () => {
    const manyUsers: Array<User> = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      status: 'active',
    }));
    const { getByText, getByTestId } = render(
      <FlexTable columns={buildColumns()} data={manyUsers} t={t} />,
    );

    expect(getByText('User 0')).toBeDefined();

    fireEvent.click(getByText('common.next'));
    expect(getByText('User 10')).toBeDefined();

    fireEvent.click(getByText('common.last'));
    expect(getByText('User 20')).toBeDefined();
    expect(
      (getByTestId('pagination-previous-button') as HTMLButtonElement).disabled,
    ).toBe(false);

    fireEvent.click(getByText('common.first'));
    expect(getByText('User 0')).toBeDefined();
  });

  test('changing the page size via the dropdown re-paginates the data', async () => {
    const manyUsers: Array<User> = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      status: 'active',
    }));
    const { getByText, findByText, queryByText } = render(
      <FlexTable columns={buildColumns()} data={manyUsers} t={t} />,
    );

    const pageSizeTrigger = getByText('10');
    fireEvent.pointerDown(pageSizeTrigger, { button: 0, pointerId: 1 });
    fireEvent.pointerUp(pageSizeTrigger, { button: 0, pointerId: 1 });
    fireEvent.click(pageSizeTrigger);

    const option20 = await findByText('20');
    fireEvent.click(option20);

    expect(getByText('User 19')).toBeDefined();
    expect(queryByText('User 20')).toBeNull();
  });
});
