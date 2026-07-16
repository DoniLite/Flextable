import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { EntityActionsMenu } from './EntityActionsMenu';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

interface TestEntity {
  id: string;
  name: string;
}

const entity: TestEntity = { id: 'e1', name: 'Widget' };

function openMenu(trigger: HTMLElement) {
  fireEvent.pointerDown(trigger, { button: 0, pointerId: 1 });
  fireEvent.pointerUp(trigger, { button: 0, pointerId: 1 });
  fireEvent.click(trigger);
}

describe('EntityActionsMenu', () => {
  test('shows edit/delete items and invokes the right callback', async () => {
    let editedId: string | undefined;
    let deletedId: string | undefined;
    const { getByTestId, findByTestId } = render(
      <EntityActionsMenu
        entity={entity}
        actionsLabel="Actions"
        editLabel="Edit"
        deleteLabel="Delete"
        onEdit={(e) => {
          editedId = e.id;
        }}
        onDelete={(id) => {
          deletedId = id as string;
        }}
      />,
    );

    openMenu(getByTestId('actions-dropdown'));
    const editItem = await findByTestId('edit-menu-item');
    fireEvent.click(editItem);
    expect(editedId).toBe('e1');

    openMenu(getByTestId('actions-dropdown'));
    const deleteItem = await findByTestId('delete-menu-item');
    fireEvent.click(deleteItem);
    expect(deletedId).toBe('e1');
  });

  test('disables the trigger when neither edit nor delete is allowed', () => {
    const { getByTestId } = render(
      <EntityActionsMenu
        entity={entity}
        actionsLabel="Actions"
        editLabel="Edit"
        deleteLabel="Delete"
        canEdit={false}
        canDelete={false}
      />,
    );
    expect((getByTestId('actions-dropdown') as HTMLButtonElement).disabled).toBe(true);
  });

  test('renders visible custom actions and hides ones filtered by isVisible', async () => {
    const clicked: Array<string> = [];
    const { getByTestId, findByText, queryByText } = render(
      <EntityActionsMenu
        entity={entity}
        actionsLabel="Actions"
        editLabel="Edit"
        deleteLabel="Delete"
        customActions={[
          { label: 'Archive', onClick: () => clicked.push('archive') },
          {
            label: (e) => `Hidden for ${e.name}`,
            onClick: () => clicked.push('hidden'),
            isVisible: () => false,
          },
        ]}
      />,
    );

    openMenu(getByTestId('actions-dropdown'));
    const archiveItem = await findByText('Archive');
    expect(queryByText('Hidden for Widget')).toBeNull();

    fireEvent.click(archiveItem);
    expect(clicked).toEqual(['archive']);
  });

  test('falls back to the "ghost" button variant for an unrecognized custom action variant', async () => {
    const { getByTestId, findByText } = render(
      <EntityActionsMenu
        entity={entity}
        actionsLabel="Actions"
        editLabel="Edit"
        deleteLabel="Delete"
        customActions={[
          { label: 'Weird', onClick: () => {}, variant: 'not-a-real-variant' },
        ]}
      />,
    );

    openMenu(getByTestId('actions-dropdown'));
    const weirdItem = await findByText('Weird');
    expect(weirdItem.className).not.toContain('not-a-real-variant');
  });
});
