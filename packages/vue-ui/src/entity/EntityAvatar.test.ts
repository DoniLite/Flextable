import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import EntityAvatar from './EntityAvatar.vue';

describe('EntityAvatar', () => {
  test('renders initials from the name when there is no image', () => {
    const wrapper = mount(EntityAvatar, { props: { name: 'Ada Lovelace' } });
    expect(wrapper.text()).toBe('AL');
  });

  test('falls back to fallbackText when name is absent', () => {
    const wrapper = mount(EntityAvatar, { props: { fallbackText: 'Team Bravo' } });
    expect(wrapper.text()).toBe('TB');
  });

  test('falls back to a single "?" when neither name nor fallbackText is given', () => {
    const wrapper = mount(EntityAvatar, {});
    expect(wrapper.text()).toBe('?');
  });

  test('ignores an image value that is not a usable http(s)/data URL', () => {
    const wrapper = mount(EntityAvatar, {
      props: { name: 'Ada Lovelace', image: 'not-a-url' },
    });
    expect(wrapper.text()).toBe('AL');
  });

  test('accepts a data: URL as a usable image source', () => {
    const wrapper = mount(EntityAvatar, {
      props: { name: 'Ada Lovelace', image: 'data:image/png;base64,AAAA' },
    });
    expect(wrapper.text()).not.toBe('AL');
  });
});
