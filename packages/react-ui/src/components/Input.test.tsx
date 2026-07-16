import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Input } from './Input';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Input', () => {
  test('accepts a placeholder and forwards value changes', () => {
    let value = '';
    const { getByPlaceholderText } = render(
      <Input
        placeholder="Search..."
        value={value}
        onChange={(e) => {
          value = e.target.value;
        }}
      />,
    );
    const input = getByPlaceholderText('Search...') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'hello' } });
    expect(value).toBe('hello');
  });
});
