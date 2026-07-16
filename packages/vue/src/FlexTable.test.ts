import { describe, expect, test } from 'bun:test';
import type { TranslateFn } from '@flextable/core';
import { ColumnFactory } from '@flextable/core';
import { mount } from '@vue/test-utils';
import type { Component } from 'vue';
import { toVueColumnDef } from './columnFactory';
import FlexTable from './FlexTable.vue';

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
    toVueColumnDef(factory.select(), { t }),
    toVueColumnDef(factory.text({ accessorKey: 'name', headerKey: 'users.name' }), { t }),
    toVueColumnDef(factory.actions({ onDelete: () => {}, onEdit: () => {} }), { t }),
  ];
}

describe('FlexTable', () => {
  test('renders one row per data item', () => {
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: users, t },
    });
    expect(wrapper.text()).toContain('Bob');
    expect(wrapper.text()).toContain('Ada');
    expect(wrapper.text()).toContain('Carl');
  });

  test('shows the no-results message for an empty dataset', () => {
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: [], t },
    });
    expect(wrapper.text()).toContain('common.noResult');
  });

  test('client-side global search filters rows down', async () => {
    const wrapper = mount(FlexTable as Component, {
      props: {
        columns: buildColumns(),
        data: users,
        t,
        serverSideFiltering: false,
        searchColumns: ['name'],
        useFuzzySearch: false,
      },
      attachTo: document.body,
    });
    const search = wrapper.get('input[type="text"]');
    await search.setValue('ada');
    await search.trigger('keyup');

    expect(wrapper.text()).toContain('Ada');
    expect(wrapper.text()).not.toContain('Bob');
    wrapper.unmount();
  });

  test('emits update:search on every search input change regardless of serverSideFiltering', async () => {
    const wrapper = mount(FlexTable as Component, {
      props: {
        columns: buildColumns(),
        data: users,
        t,
        serverSideFiltering: false,
      },
      attachTo: document.body,
    });
    const search = wrapper.get('input[type="text"]');
    await search.setValue('ada');
    await search.trigger('keyup');

    expect(wrapper.emitted('update:search')?.flat()).toContain('ada');
    wrapper.unmount();
  });

  test('the asset slot can trigger search via handleSearchUpdate', async () => {
    const wrapper = mount(FlexTable as Component, {
      props: {
        columns: buildColumns(),
        data: users,
        t,
        serverSideFiltering: false,
        searchColumns: ['name'],
        useFuzzySearch: false,
      },
      slots: {
        asset: `<template #asset="{ handleSearchUpdate }">
          <button type="button" @click="handleSearchUpdate('ada')">custom-search-trigger</button>
        </template>`,
      },
      attachTo: document.body,
    });
    await wrapper.get('button').trigger('click');
    expect(wrapper.text()).toContain('Ada');
    expect(wrapper.text()).not.toContain('Bob');
    wrapper.unmount();
  });

  test('the tableFilters slot can trigger search via handleSearchUpdate', async () => {
    const wrapper = mount(FlexTable as Component, {
      props: {
        columns: buildColumns(),
        data: users,
        t,
        serverSideFiltering: false,
        searchColumns: ['name'],
        useFuzzySearch: false,
      },
      slots: {
        tableFilters: `<template #tableFilters="{ handleSearchUpdate }">
          <button type="button" @click="handleSearchUpdate('carl')">custom-filter-search-trigger</button>
        </template>`,
      },
      attachTo: document.body,
    });
    const trigger = wrapper
      .findAll('button')
      .find((b) => b.text() === 'custom-filter-search-trigger');
    await trigger?.trigger('click');
    expect(wrapper.text()).toContain('Carl');
    expect(wrapper.text()).not.toContain('Bob');
    wrapper.unmount();
  });

  test('client-side sorting toggles when a sortable header is clicked', async () => {
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: users, t },
    });
    const headerButtons = wrapper
      .findAll('button')
      .filter((b) => b.text() === 'users.name');
    await headerButtons[0]?.trigger('click');
    const rows = wrapper.findAll('tr').slice(1);
    expect(rows[0]?.text()).toContain('Ada');
  });

  test('bulk-delete button appears once a row is selected and deletes it', async () => {
    let deleted: Array<string> | undefined;
    const columns = [
      toVueColumnDef(factory.select(), { t }),
      toVueColumnDef(factory.text({ accessorKey: 'name', headerKey: 'users.name' }), {
        t,
      }),
      toVueColumnDef(
        factory.actions({
          onDelete: (ids) => {
            deleted = ids;
          },
          onEdit: () => {},
        }),
        { t },
      ),
    ];
    const wrapper = mount(FlexTable as Component, {
      props: { columns, data: users, t },
      attachTo: document.body,
    });
    const rowCheckboxes = wrapper.findAll('[role="checkbox"]').slice(1);
    await rowCheckboxes[0]?.trigger('click');
    await wrapper.get('[data-testid="bulk-delete-button"]').trigger('click');
    expect(deleted).toEqual(['u1']);
    wrapper.unmount();
  });

  test('column-visibility dropdown can hide a column', async () => {
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: users, t },
      attachTo: document.body,
    });
    const dropdownTrigger = wrapper
      .findAll('span')
      .find((s) => s.text().includes('common.columns'));
    await dropdownTrigger?.trigger('click');

    const nameCheckboxItem = document.querySelectorAll('[role="menuitemcheckbox"]');
    const nameItem = Array.from(nameCheckboxItem).find(
      (el) => el.textContent?.trim() === 'name',
    );
    (nameItem as HTMLElement | undefined)?.click();

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).not.toContain('Bob');
    wrapper.unmount();
  });

  test('pagination controls disable/enable appropriately for a single page of data', () => {
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: users, t },
    });
    expect(
      (
        wrapper.get('[data-testid="pagination-previous-button"]')
          .element as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  test('paginates a larger client-side dataset via next/first/last controls', async () => {
    const manyUsers: Array<User> = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      status: 'active',
    }));
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: manyUsers, t },
    });

    expect(wrapper.text()).toContain('User 0');

    await wrapper.get('[data-testid="pagination-next-button"]').trigger('click');
    expect(wrapper.text()).toContain('User 10');

    await wrapper.get('[data-testid="pagination-last-button"]').trigger('click');
    expect(wrapper.text()).toContain('User 20');
    expect(
      (
        wrapper.get('[data-testid="pagination-previous-button"]')
          .element as HTMLButtonElement
      ).disabled,
    ).toBe(false);

    await wrapper.get('[data-testid="pagination-first-button"]').trigger('click');
    expect(wrapper.text()).toContain('User 0');
  });

  test('changing the page size via the dropdown re-paginates the data', async () => {
    const manyUsers: Array<User> = Array.from({ length: 25 }, (_, i) => ({
      id: `u${i}`,
      name: `User ${i}`,
      status: 'active',
    }));
    const wrapper = mount(FlexTable as Component, {
      props: { columns: buildColumns(), data: manyUsers, t },
      attachTo: document.body,
    });

    await wrapper.get('[data-testid="pagination-page-size-button"]').trigger('click');
    const option20 = document.querySelector<HTMLElement>(
      '[data-testid="pagination-size-20"]',
    );
    option20?.click();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain('User 19');
    expect(wrapper.text()).not.toContain('User 20');
    wrapper.unmount();
  });
});
