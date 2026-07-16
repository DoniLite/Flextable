import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { EntityTitle } from './EntityTitle';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('EntityTitle', () => {
  test('renders the title and description by default', () => {
    const { getByTestId } = render(
      <EntityTitle title="Acme Inc" description="A vendor" />,
    );
    expect(getByTestId('entity-title').textContent).toBe('Acme Inc');
    expect(getByTestId('entity-description').textContent).toBe('A vendor');
  });

  test('omits the description block when hasDescription is false', () => {
    const { queryByTestId } = render(
      <EntityTitle title="Acme Inc" description="A vendor" hasDescription={false} />,
    );
    expect(queryByTestId('entity-description')).toBeNull();
  });

  test('omits the description block when there is no description text', () => {
    const { queryByTestId } = render(<EntityTitle title="Acme Inc" />);
    expect(queryByTestId('entity-description')).toBeNull();
  });
});
