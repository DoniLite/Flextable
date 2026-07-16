import { describe, expect, test } from 'bun:test';
import { mount } from '@vue/test-utils';
import Table from './Table.vue';
import TableBody from './TableBody.vue';
import TableCell from './TableCell.vue';
import TableHead from './TableHead.vue';
import TableHeader from './TableHeader.vue';
import TableRow from './TableRow.vue';

describe('Table', () => {
  test('renders a header row and a body row', () => {
    const wrapper = mount({
      components: { Table, TableHeader, TableBody, TableRow, TableHead, TableCell },
      template: `
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
          <TableBody><TableRow><TableCell>Ada</TableCell></TableRow></TableBody>
        </Table>
      `,
    });
    expect(wrapper.text()).toContain('Name');
    expect(wrapper.text()).toContain('Ada');
  });
});
