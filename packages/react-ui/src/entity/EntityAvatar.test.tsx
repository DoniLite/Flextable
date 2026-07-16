import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { EntityAvatar } from './EntityAvatar';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('EntityAvatar', () => {
  test('renders initials from the name when there is no image', () => {
    const { getByText } = render(<EntityAvatar name="Ada Lovelace" />);
    expect(getByText('AL')).toBeDefined();
  });

  test('falls back to fallbackText when name is absent', () => {
    const { getByText } = render(<EntityAvatar fallbackText="Team Bravo" />);
    expect(getByText('TB')).toBeDefined();
  });

  test('falls back to a single "?" when neither name nor fallbackText is given', () => {
    const { getByText } = render(<EntityAvatar />);
    expect(getByText('?')).toBeDefined();
  });

  test('ignores an image value that is not a usable http(s)/data URL', () => {
    const { getByText } = render(<EntityAvatar name="Ada Lovelace" image="not-a-url" />);
    expect(getByText('AL')).toBeDefined();
  });

  test('accepts a data: URL as a usable image source', () => {
    const { queryByText } = render(
      <EntityAvatar name="Ada Lovelace" image="data:image/png;base64,AAAA" />,
    );
    expect(queryByText('AL')).toBeNull();
  });
});
