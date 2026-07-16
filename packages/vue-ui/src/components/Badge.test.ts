import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Badge from './Badge.vue';

describe('Badge', () => {
  test('renders its slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'Active' } });
    expect(wrapper.text()).toBe('Active');
  });

  test('applies the requested variant class', () => {
    const wrapper = mount(Badge, { props: { variant: 'destructive' } });
    expect(wrapper.classes()).toContain('bg-destructive');
  });
});
