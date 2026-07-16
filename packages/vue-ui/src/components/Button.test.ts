import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Button from './Button.vue';

describe('Button', () => {
  test('renders its slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Click me' } });
    expect(wrapper.text()).toBe('Click me');
  });

  test('applies the disabled attribute when passed', () => {
    const wrapper = mount(Button, { props: { disabled: true } });
    expect(wrapper.attributes('disabled')).toBeDefined();
  });

  test('applies the requested variant class', () => {
    const wrapper = mount(Button, { props: { variant: 'destructive' } });
    expect(wrapper.classes()).toContain('bg-destructive');
  });
});
