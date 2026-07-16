import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Checkbox from './Checkbox.vue';

describe('Checkbox', () => {
  test('reflects the checked state and emits update:checked on click', async () => {
    const wrapper = mount(Checkbox, {
      props: { checked: false, 'aria-label': 'select' },
    });
    expect(wrapper.get('button').attributes('data-state')).toBe('unchecked');

    await wrapper.get('button').trigger('click');
    expect(wrapper.emitted('update:checked')?.[0]).toEqual([true]);

    await wrapper.setProps({ checked: true });
    expect(wrapper.get('button').attributes('data-state')).toBe('checked');
  });
});
