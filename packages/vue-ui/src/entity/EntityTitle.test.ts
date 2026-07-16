import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import EntityTitle from './EntityTitle.vue';

describe('EntityTitle', () => {
  test('renders the title and description by default', () => {
    const wrapper = mount(EntityTitle, {
      props: { title: 'Acme Inc', description: 'A vendor' },
    });
    expect(wrapper.get('[data-testid="entity-title"]').text()).toBe('Acme Inc');
    expect(wrapper.get('[data-testid="entity-description"]').text()).toBe('A vendor');
  });

  test('omits the description block when hasDescription is false', () => {
    const wrapper = mount(EntityTitle, {
      props: { title: 'Acme Inc', description: 'A vendor', hasDescription: false },
    });
    expect(wrapper.find('[data-testid="entity-description"]').exists()).toBe(false);
  });

  test('omits the description block when there is no description text', () => {
    const wrapper = mount(EntityTitle, { props: { title: 'Acme Inc' } });
    expect(wrapper.find('[data-testid="entity-description"]').exists()).toBe(false);
  });
});
