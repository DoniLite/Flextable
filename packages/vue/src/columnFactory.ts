import type {
  ColumnConfig,
  CustomColumnConfig,
  EntityLike,
  FlexTableKeys,
  TranslateFn,
} from '@flextable/core';
import { resolveClassName, resolveFlexTableKeys } from '@flextable/core';
import {
  Badge,
  Button,
  Checkbox,
  cn,
  EntityActionsMenu,
  EntityAvatar,
  EntityTitle,
} from '@flextable/vue-ui';
import type { ColumnDef } from '@tanstack/vue-table';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-vue-next';
import type { Component } from 'vue';
import { h } from 'vue';
import { sortableHeader } from './helpers/sortableHeader';

export const CHECKBOX_CLASSES =
  'flex items-center rounded-full border border-[hsl(209.03_20.26%_30%)] dark:border-[hsl(208.7_29.87%_84.9%)]';

export interface FlexTableComponents {
  Checkbox: Component;
  Badge: Component;
  Button: Component;
  EntityAvatar: Component;
  EntityTitle: Component;
  EntityActionsMenu: Component;
}

function defaultComponents(): FlexTableComponents {
  return { Checkbox, Badge, Button, EntityAvatar, EntityTitle, EntityActionsMenu };
}

export interface ToVueColumnDefOptions<TEntity extends EntityLike> {
  t: TranslateFn;
  components?: Partial<FlexTableComponents>;
  /** Overrides for the fixed translation keys used by generated actions/expandRow cells — see `FlexTableKeys`. */
  keys?: Partial<FlexTableKeys>;
  customRenderers?: Record<
    string,
    (options: unknown, t: TranslateFn) => ColumnDef<TEntity>['cell']
  >;
}

const KNOWN_COLUMN_KINDS = [
  'select',
  'avatar',
  'name',
  'text',
  'date',
  'count',
  'badge',
  'actions',
  'expandRow',
] as const;

/** See @flextable/react's toReactColumnDef for why this guard is needed before the switch. */
function isKnownColumnKind<TEntity extends EntityLike>(
  config: ColumnConfig<TEntity>,
): config is Exclude<ColumnConfig<TEntity>, CustomColumnConfig<TEntity>> {
  return (KNOWN_COLUMN_KINDS as ReadonlyArray<string>).includes(config.kind);
}

function containerProps<TEntity>(
  className: ((entity: TEntity) => string) | string | undefined,
  testId: string | undefined,
  entity: TEntity,
) {
  return {
    class: cn(resolveClassName(className, entity)),
    ...(testId ? { 'data-testid': testId } : {}),
  };
}

/** Translates a framework-agnostic `ColumnConfig` from `@flextable/core`'s `ColumnFactory` into a real TanStack Vue `ColumnDef`. */
export function toVueColumnDef<TEntity extends EntityLike>(
  config: ColumnConfig<TEntity>,
  options: ToVueColumnDefOptions<TEntity>,
): ColumnDef<TEntity, unknown> {
  const { t } = options;
  const keys = resolveFlexTableKeys(options.keys);
  const components = { ...defaultComponents(), ...options.components };
  const {
    Checkbox: CheckboxCmp,
    Badge: BadgeCmp,
    Button: ButtonCmp,
    EntityAvatar: AvatarCmp,
    EntityTitle: TitleCmp,
    EntityActionsMenu: ActionsCmp,
  } = components;

  if (!isKnownColumnKind(config)) {
    const renderer = options.customRenderers?.[config.kind];
    if (!renderer) {
      throw new Error(
        `toVueColumnDef: no renderer registered for custom column kind "${config.kind}". Pass it via customRenderers.`,
      );
    }
    return {
      id: config.id ?? config.kind,
      header: config.kind,
      cell: renderer(config.options, t),
    };
  }

  switch (config.kind) {
    case 'select':
      return {
        id: 'select',
        header: ({ table }) =>
          h(
            'div',
            {
              class: cn(
                'flex items-center justify-center',
                resolveClassName(config.className, undefined),
              ),
              'data-testid': config.testId,
            },
            h(CheckboxCmp, {
              className: CHECKBOX_CLASSES,
              checked: table.getIsAllPageRowsSelected(),
              onClick: () => table.toggleAllRowsSelected(),
              'aria-label': config.selectAllLabel,
            }),
          ),
        cell: ({ row }) =>
          h(
            'div',
            {
              class: cn(
                'flex items-center justify-center',
                resolveClassName(config.className, row.original),
              ),
              'data-testid': config.testId,
            },
            h(CheckboxCmp, {
              className: CHECKBOX_CLASSES,
              checked: row.getIsSelected(),
              'onUpdate:checked': (value: boolean) => row.toggleSelected(value),
              'aria-label': config.selectRowLabel,
            }),
          ),
        enableSorting: false,
        enableHiding: false,
      };

    case 'avatar':
      return {
        accessorKey: config.accessorKey as string,
        header: config.headerLabel,
        cell: ({ row }) =>
          h(
            'div',
            containerProps(config.className, config.testId, row.original),
            h(AvatarCmp, {
              image: config.getImage(row.original),
              name: config.getName(row.original),
              isSelected: row.getIsSelected(),
            }),
          ),
      };

    case 'name':
      return {
        accessorKey: config.accessorKey as string,
        id: config.id,
        header: ({ column }) => sortableHeader(column, config.headerLabel, false),
        cell: ({ row }) => {
          const title = config.getTitle(row.original);
          const description = config.hasDescription
            ? config.getDescription?.(row.original)
            : undefined;

          if (config.onTitleClick) {
            return h(
              'div',
              {
                class: cn(
                  'flex w-full flex-col',
                  resolveClassName(config.className, row.original),
                ),
              },
              [
                h(
                  'button',
                  {
                    type: 'button',
                    class: cn(
                      'cursor-pointer truncate text-left text-foreground',
                      config.titleClassName,
                      config.hasDescription && 'font-medium',
                    ),
                    onClick: () => config.onTitleClick?.(row.original),
                    'data-testid': config.testId
                      ? `${config.testId}-title-link`
                      : undefined,
                  },
                  title,
                ),
                config.hasDescription && description
                  ? h(
                      'span',
                      {
                        class: cn(
                          'w-full truncate text-muted-foreground',
                          config.descriptionClassName,
                        ),
                      },
                      description,
                    )
                  : null,
              ],
            );
          }

          return h(
            'div',
            containerProps(config.className, config.testId, row.original),
            h(TitleCmp, {
              title,
              description,
              titleClassName: config.titleClassName,
              descriptionClassName: config.descriptionClassName,
              hasDescription: config.hasDescription,
            }),
          );
        },
      };

    case 'text':
      return {
        accessorKey: config.accessorKey as string,
        header: ({ column }) => sortableHeader(column, config.headerLabel, false),
        cell: ({ row }) => {
          const value = config.getValue
            ? config.getValue(row.original)
            : ((row.getValue(config.accessorKey as string) as string | undefined) ??
              config.fallbackValue);
          const display =
            config.translationPrefix && typeof value === 'string'
              ? t(`${config.translationPrefix}.${value}`)
              : value;
          return h(
            'div',
            containerProps(config.className, config.testId, row.original),
            display,
          );
        },
      };

    case 'date':
      return {
        accessorKey: config.accessorKey as string,
        id: config.id,
        header: ({ column }) => sortableHeader(column, config.headerLabel, false),
        cell: ({ row }) =>
          h(
            'div',
            containerProps(config.className, config.testId, row.original),
            config.formatDate(
              row.original[config.accessorKey] as unknown as string | Date,
            ),
          ),
      };

    case 'count':
      return {
        accessorKey: config.accessorKey as string,
        header: config.headerLabel,
        cell: ({ row }) =>
          h(
            'div',
            containerProps(config.className, config.testId, row.original),
            String(row.original[config.accessorKey] as unknown as number),
          ),
      };

    case 'badge':
      return {
        accessorKey: config.accessorKey as string,
        header: config.headerLabel,
        cell: ({ row }) => {
          const value = row.original[config.accessorKey] as unknown as string;
          const variant = config.getVariant?.(row.original);
          const label = config.getLabel?.(row.original) ?? value ?? config.fallbackValue;
          const color = config.getCustomColor?.(row.original);

          return h(
            BadgeCmp,
            {
              variant,
              style: color ? { backgroundColor: color } : undefined,
              className: resolveClassName(config.className, row.original),
              'data-testid': config.testId,
            },
            () => label,
          );
        },
      };

    case 'actions':
      return {
        id: 'actions',
        header: ({ table }) => {
          const selectedIds = table
            .getSelectedRowModel()
            .rows.map((row) => row.original.id);
          if (selectedIds.length === 0 || !config.shouldShowTrashIcon) return null;

          return h(
            'div',
            { class: 'mx-auto flex w-10 justify-center' },
            h(
              ButtonCmp,
              {
                className: 'h-8 w-8 rounded-full p-1',
                variant: 'destructive',
                size: 'sm',
                'data-testid': 'bulk-delete-button',
                onClick: () =>
                  config.onDelete(selectedIds, () => table.resetRowSelection()),
              },
              () => h(Trash2, { size: 16 }),
            ),
          );
        },
        cell: ({ row }) => {
          const entity = row.original;
          return h(
            'div',
            {
              class: cn(
                'mx-auto flex w-10 justify-center',
                resolveClassName(config.className, entity),
              ),
              'data-testid': config.testId,
            },
            h(ActionsCmp, {
              entity,
              actionsLabel: t(keys.actions),
              editLabel: t(keys.edit),
              deleteLabel: t(keys.delete),
              canEdit: config.canEdit ? config.canEdit(entity) : true,
              canDelete: config.canDelete ? config.canDelete(entity) : true,
              onEdit: (e: TEntity) => config.onEdit(e),
              onDelete: (id: TEntity['id']) => config.onDelete([id]),
              customActions: config.customActions,
            }),
          );
        },
        enableSorting: false,
        enableHiding: false,
        size: 60,
        maxSize: 80,
      };

    case 'expandRow':
      return {
        id: 'expand',
        header: config.headerLabel,
        cell: ({ row }) =>
          h(
            ButtonCmp,
            {
              variant: 'ghost',
              className: cn('-ml-2', resolveClassName(config.className, row.original)),
              size: 'sm',
              'data-testid': config.testId,
              onClick: () => row.toggleExpanded(),
            },
            () => [
              t(keys.expand),
              ' ',
              h(row.getIsExpanded() ? ChevronDown : ChevronRight),
            ],
          ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      };
  }
}
