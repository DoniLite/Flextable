import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Avatar from './Avatar.vue';
import AvatarFallback from './AvatarFallback.vue';

describe('Avatar', () => {
  test('renders fallback content', () => {
    const wrapper = mount({
      components: { Avatar, AvatarFallback },
      template: `<Avatar><AvatarFallback>AB</AvatarFallback></Avatar>`,
    });
    expect(wrapper.text()).toBe('AB');
  });
});
