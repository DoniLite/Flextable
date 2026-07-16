import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import EntityActionsMenu from './EntityActionsMenu.vue';

interface TestEntity {
  id: string;
  name: string;
}

const entity: TestEntity = { id: 'e1', name: 'Widget' };

async function openMenu(wrapper: ReturnType<typeof mount>) {
  await wrapper.get('[data-testid="actions-dropdown"]').trigger('click');
}

describe('EntityActionsMenu', () => {
  test('shows edit/delete items and emits the right event', async () => {
    const wrapper = mount(EntityActionsMenu, {
      props: {
        entity,
        actionsLabel: 'Actions',
        editLabel: 'Edit',
        deleteLabel: 'Delete',
      },
      attachTo: document.body,
    });

    await openMenu(wrapper);
    await document.querySelector<HTMLElement>('[data-testid="edit-menu-item"]')?.click();
    expect(wrapper.emitted('edit')?.[0]).toEqual([entity]);

    wrapper.unmount();
  });

  test('disables the trigger when neither edit nor delete is allowed', () => {
    const wrapper = mount(EntityActionsMenu, {
      props: {
        entity,
        actionsLabel: 'Actions',
        editLabel: 'Edit',
        deleteLabel: 'Delete',
        canEdit: false,
        canDelete: false,
      },
    });
    expect(
      wrapper.get('[data-testid="actions-dropdown"]').attributes('disabled'),
    ).toBeDefined();
  });

  test('renders visible custom actions and hides ones filtered by isVisible', async () => {
    const wrapper = mount(EntityActionsMenu, {
      props: {
        entity,
        actionsLabel: 'Actions',
        editLabel: 'Edit',
        deleteLabel: 'Delete',
        customActions: [
          { label: 'Archive', onClick: () => {} },
          { label: 'Hidden', onClick: () => {}, isVisible: () => false },
        ],
      },
      attachTo: document.body,
    });

    await openMenu(wrapper);
    expect(document.body.textContent).toContain('Archive');
    expect(document.body.textContent).not.toContain('Hidden');

    wrapper.unmount();
  });
});
