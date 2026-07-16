import type {
  ColumnConfig,
  CustomColumnConfig,
  EntityLike,
  FlexTableKeys,
  TranslateFn,
} from '@flextable/core';
import { resolveClassName, resolveFlexTableKeys } from '@flextable/core';
import type {
  BadgeProps,
  ButtonProps,
  EntityActionsMenuProps,
  EntityAvatarProps,
  EntityTitleProps,
} from '@flextable/react-ui';
import {
  Badge,
  Button,
  Checkbox,
  cn,
  EntityActionsMenu,
  EntityAvatar,
  EntityTitle,
} from '@flextable/react-ui';
import type { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import type { ComponentType } from 'react';
import { sortableHeader } from './helpers/sortableHeader';

export const CHECKBOX_CLASSES =
  'flex items-center rounded-full border border-[hsl(209.03_20.26%_30%)] dark:border-[hsl(208.7_29.87%_84.9%)]';

export interface FlexTableComponents<TEntity extends EntityLike> {
  Checkbox: typeof Checkbox;
  Badge: ComponentType<BadgeProps>;
  Button: ComponentType<ButtonProps>;
  EntityAvatar: ComponentType<EntityAvatarProps>;
  EntityTitle: ComponentType<EntityTitleProps>;
  EntityActionsMenu: ComponentType<EntityActionsMenuProps<TEntity>>;
}

function defaultComponents<TEntity extends EntityLike>(): FlexTableComponents<TEntity> {
  return {
    Checkbox,
    Badge,
    Button,
    EntityAvatar,
    EntityTitle,
    EntityActionsMenu,
  };
}

export interface ToReactColumnDefOptions<TEntity extends EntityLike> {
  t: TranslateFn;
  components?: Partial<FlexTableComponents<TEntity>>;
  /** Overrides for the fixed translation keys used by generated actions/expandRow cells — see `FlexTableKeys`. */
  keys?: Partial<FlexTableKeys>;
  /** Renderers for kinds registered via `ColumnFactory.registerColumnType()` / built with `.custom()`. */
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

/**
 * `CustomColumnConfig.kind` is a plain `string` (not a literal), which would
 * otherwise defeat TS's discriminated-union narrowing on every `case` below
 * (a wide-`string` union member makes every literal comparison ambiguous).
 * Excluding it via this guard first lets the switch narrow normally.
 */
function isKnownColumnKind<TEntity extends EntityLike>(
  config: ColumnConfig<TEntity>,
): config is Exclude<ColumnConfig<TEntity>, CustomColumnConfig<TEntity>> {
  return (KNOWN_COLUMN_KINDS as ReadonlyArray<string>).includes(config.kind);
}

function containerProps<TEntity>(
  className: ((entity: TEntity) => string) | string | undefined,
  testId: string | undefined,
  entity: TEntity | undefined,
) {
  return {
    className: cn(resolveClassName(className, entity)),
    ...(testId ? { 'data-testid': testId } : {}),
  };
}

/** Translates a framework-agnostic `ColumnConfig` from `@flextable/core`'s `ColumnFactory` into a real TanStack `ColumnDef`. */
export function toReactColumnDef<TEntity extends EntityLike>(
  config: ColumnConfig<TEntity>,
  options: ToReactColumnDefOptions<TEntity>,
): ColumnDef<TEntity, unknown> {
  const { t } = options;
  const keys = resolveFlexTableKeys(options.keys);
  const components = { ...defaultComponents<TEntity>(), ...options.components };
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
        `toReactColumnDef: no renderer registered for custom column kind "${config.kind}". Pass it via customRenderers.`,
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
        header: ({ table }) => (
          <div
            className={cn(
              'flex items-center justify-center',
              resolveClassName(config.className, undefined),
            )}
            data-testid={config.testId}
          >
            <CheckboxCmp
              className={CHECKBOX_CLASSES}
              checked={table.getIsAllPageRowsSelected()}
              onClick={() => table.toggleAllRowsSelected()}
              aria-label={config.selectAllLabel}
            />
          </div>
        ),
        cell: ({ row }) => (
          <div
            className={cn(
              'flex items-center justify-center',
              resolveClassName(config.className, row.original),
            )}
            data-testid={config.testId}
          >
            <CheckboxCmp
              className={CHECKBOX_CLASSES}
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label={config.selectRowLabel}
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      };

    case 'avatar':
      return {
        accessorKey: config.accessorKey as string,
        header: config.headerLabel,
        cell: ({ row }) => (
          <div {...containerProps(config.className, config.testId, row.original)}>
            <AvatarCmp
              image={config.getImage(row.original)}
              name={config.getName(row.original)}
              isSelected={row.getIsSelected()}
            />
          </div>
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
            return (
              <div
                className={cn(
                  'flex w-full flex-col',
                  resolveClassName(config.className, row.original),
                )}
              >
                <button
                  type="button"
                  className={cn(
                    'cursor-pointer truncate text-left text-foreground',
                    config.titleClassName,
                    config.hasDescription && 'font-medium',
                  )}
                  onClick={() => config.onTitleClick?.(row.original)}
                  data-testid={config.testId ? `${config.testId}-title-link` : undefined}
                >
                  {title}
                </button>
                {config.hasDescription && description && (
                  <span
                    className={cn(
                      'w-full truncate text-muted-foreground',
                      config.descriptionClassName,
                    )}
                  >
                    {description}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div {...containerProps(config.className, config.testId, row.original)}>
              <TitleCmp
                title={title}
                description={description}
                titleClassName={config.titleClassName}
                descriptionClassName={config.descriptionClassName}
                hasDescription={config.hasDescription}
              />
            </div>
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

          return (
            <div {...containerProps(config.className, config.testId, row.original)}>
              {display}
            </div>
          );
        },
      };

    case 'date':
      return {
        accessorKey: config.accessorKey as string,
        id: config.id,
        header: ({ column }) => sortableHeader(column, config.headerLabel, false),
        cell: ({ row }) => (
          <div {...containerProps(config.className, config.testId, row.original)}>
            {config.formatDate(
              row.original[config.accessorKey] as unknown as string | Date,
            )}
          </div>
        ),
      };

    case 'count':
      return {
        accessorKey: config.accessorKey as string,
        header: config.headerLabel,
        cell: ({ row }) => (
          <div {...containerProps(config.className, config.testId, row.original)}>
            {row.original[config.accessorKey] as unknown as number}
          </div>
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

          return (
            <BadgeCmp
              variant={variant as BadgeProps['variant']}
              style={color ? { backgroundColor: color } : undefined}
              className={resolveClassName(config.className, row.original)}
              data-testid={config.testId}
            >
              {label}
            </BadgeCmp>
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

          return (
            <div className="mx-auto flex w-10 justify-center">
              <ButtonCmp
                className="h-8 w-8 rounded-full p-1"
                variant="destructive"
                size="sm"
                data-testid="bulk-delete-button"
                onClick={() =>
                  config.onDelete(selectedIds, () => table.resetRowSelection())
                }
              >
                <Trash2 size={16} />
              </ButtonCmp>
            </div>
          );
        },
        cell: ({ row }) => {
          const entity = row.original;
          return (
            <div
              className={cn(
                'mx-auto flex w-10 justify-center',
                resolveClassName(config.className, entity),
              )}
              data-testid={config.testId}
            >
              <ActionsCmp
                entity={entity}
                actionsLabel={t(keys.actions)}
                editLabel={t(keys.edit)}
                deleteLabel={t(keys.delete)}
                canDelete={config.canDelete ? config.canDelete(entity) : true}
                canEdit={config.canEdit ? config.canEdit(entity) : true}
                onDelete={(id) => config.onDelete([id])}
                onEdit={config.onEdit}
                customActions={
                  config.customActions as
                    | EntityActionsMenuProps<TEntity>['customActions']
                    | undefined
                }
              />
            </div>
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
        cell: ({ row }) => (
          <ButtonCmp
            variant="ghost"
            className={cn('-ml-2', resolveClassName(config.className, row.original))}
            size="sm"
            data-testid={config.testId}
            onClick={() => row.toggleExpanded()}
          >
            {t(keys.expand)} {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
          </ButtonCmp>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 50,
      };
  }
}
