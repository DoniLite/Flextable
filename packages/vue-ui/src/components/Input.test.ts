import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Input from './Input.vue';

describe('Input', () => {
  test('accepts a placeholder and emits update:modelValue on input', async () => {
    const wrapper = mount(Input, { props: { placeholder: 'Search...' } });
    const input = wrapper.find('input');
    expect(input.attributes('placeholder')).toBe('Search...');

    await input.setValue('hello');
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello']);
  });
});
