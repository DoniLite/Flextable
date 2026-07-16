import { afterEach, describe, expect, test } from 'bun:test';
import { cleanup, render } from '@testing-library/react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './Table';

afterEach(() => {
  cleanup();
  document.body.replaceChildren();
});

describe('Table', () => {
  test('renders a header row and a body row', () => {
    const { getByText } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(getByText('Name')).toBeDefined();
    expect(getByText('Ada')).toBeDefined();
  });
});
