import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Checkbox } from './Checkbox';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Checkbox', () => {
  test('reflects the checked state and toggles via onCheckedChange', () => {
    let checked = false;
    const handleChange = (value: boolean | 'indeterminate') => {
      checked = value === true;
    };
    const { getByRole, rerender } = render(
      <Checkbox checked={checked} onCheckedChange={handleChange} aria-label="select" />,
    );
    const box = getByRole('checkbox');
    expect(box.getAttribute('data-state')).toBe('unchecked');

    fireEvent.click(box);
    expect(checked).toBe(true);

    rerender(
      <Checkbox checked={checked} onCheckedChange={handleChange} aria-label="select" />,
    );
    expect(getByRole('checkbox').getAttribute('data-state')).toBe('checked');
  });
});
