import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import { DropdownMenuRoot as DropdownMenu } from 'reka-ui';
import DropdownMenuContent from './DropdownMenuContent.vue';
import DropdownMenuItem from './DropdownMenuItem.vue';
import DropdownMenuTrigger from './DropdownMenuTrigger.vue';

describe('DropdownMenu', () => {
  test('opens on trigger click and shows its items', async () => {
    const wrapper = mount(
      {
        components: {
          DropdownMenu,
          DropdownMenuTrigger,
          DropdownMenuContent,
          DropdownMenuItem,
        },
        template: `
          <DropdownMenu>
            <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        `,
      },
      { attachTo: document.body },
    );

    expect(document.body.textContent).not.toContain('Edit');

    await wrapper.get('button').trigger('click');

    expect(document.body.textContent).toContain('Edit');
    expect(document.body.textContent).toContain('Delete');

    wrapper.unmount();
  });
});
