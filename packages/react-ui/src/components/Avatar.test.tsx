import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { Avatar, AvatarFallback } from './Avatar';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Avatar', () => {
  test('renders fallback content', () => {
    const { getByText } = render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>,
    );
    expect(getByText('AB')).toBeDefined();
  });
});
