import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Card from './Card.vue';
import CardContent from './CardContent.vue';
import CardHeader from './CardHeader.vue';
import CardTitle from './CardTitle.vue';

describe('Card', () => {
  test('renders header, title and content', () => {
    const wrapper = mount({
      components: { Card, CardHeader, CardTitle, CardContent },
      template: `
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent>Body text</CardContent>
        </Card>
      `,
    });
    expect(wrapper.text()).toContain('Details');
    expect(wrapper.text()).toContain('Body text');
  });
});
