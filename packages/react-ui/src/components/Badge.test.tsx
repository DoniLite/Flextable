import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { Badge } from './Badge';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Badge', () => {
  test('renders its children', () => {
    const { getByText } = render(<Badge>Active</Badge>);
    expect(getByText('Active')).toBeDefined();
  });

  test('applies the requested variant class', () => {
    const { getByText } = render(<Badge variant="destructive">Danger</Badge>);
    expect(getByText('Danger').className).toContain('bg-destructive');
  });
});
