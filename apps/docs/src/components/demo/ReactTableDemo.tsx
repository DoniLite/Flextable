import { ColumnFactory } from '@flextable/core';
import { FlexTable, toReactColumnDef } from '@flextable/react';
import { useMemo, useState } from 'react';
import { demoT } from './demoTranslations';
import { createMockUsers, type DemoUser } from './mockUsers';

const formatDate = (value: string | Date) => new Date(value).toLocaleDateString();

export default function ReactTableDemo() {
  const [users] = useState(() => createMockUsers());

  const columns = useMemo(() => {
    const factory = new ColumnFactory<DemoUser>(demoT);

    return [
      factory.select({
        className: 'mx-3',
      }),
      factory.avatar({
        accessorKey: 'avatarUrl',
        getName: (user) => user.name,
      }),
      factory.name({
        accessorKey: 'name',
        getTitle: (user) => user.name,
        getDescription: (user) => user.email,
      }),
      factory.badge<'default' | 'secondary' | 'outline'>({
        accessorKey: 'role',
        headerKey: 'user.role',
        getVariant: (user) =>
          user.role === 'admin'
            ? 'default'
            : user.role === 'member'
              ? 'secondary'
              : 'outline',
      }),
      factory.badge<'default' | 'destructive'>({
        accessorKey: 'status',
        headerKey: 'user.status',
        getVariant: (user) => (user.status === 'active' ? 'default' : 'destructive'),
      }),
      factory.count({
        accessorKey: 'loginCount',
        headerKey: 'user.logins',
      }),
      factory.date({
        accessorKey: 'createdAt',
        headerKey: 'user.createdAt',
        formatDate,
      }),
      factory.updated({ formatDate }),
      factory.expandRow(),
      factory.actions({
        onEdit: (user) => window.alert(`Edit ${user.name}`),
        onDelete: (ids) => window.alert(`Delete ${ids.join(', ')}`),
        canDelete: (user) => user.role !== 'admin',
      }),
    ].map((config) => toReactColumnDef<DemoUser>(config, { t: demoT }));
  }, []);

  return <FlexTable columns={columns} data={users} t={demoT} />;
}
