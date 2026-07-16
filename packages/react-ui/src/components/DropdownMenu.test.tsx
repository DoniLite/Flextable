import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './DropdownMenu';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('DropdownMenu', () => {
  test('opens on trigger click and shows its items', async () => {
    const { getByText, findByText, queryByText } = render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    expect(queryByText('Edit')).toBeNull();

    const trigger = getByText('Open menu');
    fireEvent.pointerDown(trigger, { button: 0, pointerId: 1 });
    fireEvent.pointerUp(trigger, { button: 0, pointerId: 1 });
    fireEvent.click(trigger);

    expect(await findByText('Edit')).toBeDefined();
    expect(getByText('Delete')).toBeDefined();
  });
});
