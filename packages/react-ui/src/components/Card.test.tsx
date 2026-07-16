import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Card', () => {
  test('renders header, title and content', () => {
    const { getByText } = render(
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>Body text</CardContent>
      </Card>,
    );
    expect(getByText('Details')).toBeDefined();
    expect(getByText('Body text')).toBeDefined();
  });
});
