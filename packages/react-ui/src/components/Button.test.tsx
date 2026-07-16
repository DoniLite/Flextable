import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { Button } from './Button';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Button', () => {
  test('renders its children', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeDefined();
  });

  test('applies the disabled attribute when passed', () => {
    const { getByText } = render(<Button disabled>Disabled</Button>);
    const button = getByText('Disabled') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
