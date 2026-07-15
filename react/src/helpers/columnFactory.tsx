/* eslint-disable @typescript-eslint/naming-convention */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import { ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import sortableHeader from './sortableHeader';
import { filterInternDate, sortInternDate } from './table.helper';
import type { Base as BaseEntity } from '@schema/shared.schema';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactNode } from 'react';
import type { CustomAction } from '@/components/shared/entity/ActionDropdown';
import EntityAvatar from '@/components/shared/entity/Avatar';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import EntityTitle from '@/components/shared/entity/TitleWithDesc';
import { Badge } from '@/components/ui/badge';
import { useDateFormat } from '@/hooks/useDateFormat';
import { Button } from '@/components/ui/button';
import EntityActionsMenu from '@/components/shared/entity/ActionDropdown';

interface BaseColumnOptions<T = unknown> {
  headerKey?: string;
  accessorKey?: keyof T;
  testId?: string;
  className?: ((entity: T) => string) | string;
}

export const CHECKBOX_CLASSES =
  'flex items-center rounded-full border border-[hsl(209.03 20.26% 30%)] dark:border-[hsl(208.7 29.87% 84.9%)]';

function createContainerProps<T>({
  className,
  testId,
  defaultClassName = '',
  entity,
}: {
  className?: string | ((entity: T) => string);
  testId?: string;
  defaultClassName?: string;
  entity?: T;
}) {
  return {
    className: cn(
      defaultClassName,
      className
        ? typeof className === 'string'
          ? className
          : entity
            ? className(entity)
            : ''
        : '',
    ),
    ...(testId ? { 'data-testid': testId } : {}),
  };
}

interface ActionsColumnOptions<T extends BaseEntity> {
  onDelete: (ids: Array<string>, resetSelection?: () => void) => void;
  onEdit: (entity: T) => void;
  canDelete?: (entity: T) => boolean;
  shouldShowTrashIcon?: boolean;
  canEdit?: (entity: T) => boolean;
  customActions?: Array<CustomAction<T>>;
}

// -------------------- SELECT COLUMN --------------------
export function createSelectColumn<T extends BaseEntity>(
  t: (key: string) => string,
): ColumnDef<T> {
  return {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        className={CHECKBOX_CLASSES}
        checked={table.getIsAllPageRowsSelected()}
        onClick={() => table.toggleAllRowsSelected()}
        aria-label={t('common.selectAll')}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        className={CHECKBOX_CLASSES}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label={t('common.checkboxLabel')}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

// -------------------- AVATAR COLUMN --------------------
export function createAvatarColumn<T extends BaseEntity & { name?: string }>(
  t: (key: string) => string,
  options: BaseColumnOptions = {},
): ColumnDef<T> {
  const {
    accessorKey = 'avatar',
    headerKey = 'common.avatar',
    testId,
    className = '',
  } = options;
  const finalTestId = testId || `table-column-${String(accessorKey)}`;

  return {
    accessorKey,
    header: t(headerKey),
    cell: ({ row }) => (
      <div
        {...createContainerProps({
          className:
            className instanceof Function ? className(row.original) : className,
          testId: finalTestId,
          entity: row.original,
        })}
      >
        <EntityAvatar
          image={row.original[accessorKey as keyof T] as string}
          name={row.original.name}
          isSelected={row.getIsSelected()}
        />
      </div>
    ),
  };
}

// -------------------- NAME COLUMN --------------------
interface TextColumnOptions<T> extends BaseColumnOptions<T> {
  hasDescription?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  getTitleFn?: (entity: T) => string;
  getDescriptionFn?: (entity: T) => string;
  onTitleClick?: (entity: T) => void;
}

export function createNameColumn<
  T extends BaseEntity & {
    name?: string;
    title?: string;
    description?: string;
  },
>(
  t: (key: string) => string,
  options: TextColumnOptions<T> = {},
): ColumnDef<T> {
  const {
    accessorKey = 'title',
    className = '',
    hasDescription = true,
    testId,
    titleClassName = '',
    descriptionClassName = '',
    getTitleFn,
    getDescriptionFn,
    headerKey,
    onTitleClick,
  } = options;
  const finalTestId = testId || `table-column-${String(accessorKey)}`;

  return {
    accessorKey,
    id: headerKey ? t(headerKey) : t('common.name'),
    header: ({ column }) => sortableHeader(column, t('common.name'), false),
    cell: ({ row }) => {
      const title = getTitleFn
        ? getTitleFn(row.original)
        : row.original.name || row.original.title || '';
      const description =
        hasDescription && getDescriptionFn
          ? getDescriptionFn(row.original)
          : hasDescription && row.original.description
            ? row.original.description
            : undefined;

      if (onTitleClick) {
        return (
          <div
            className={cn(
              'flex w-full flex-col',
              className instanceof Function
                ? className(row.original)
                : className,
            )}
          >
            {/** biome-ignore lint/a11y/useValidAnchor: <> */}
            <a
              href="#"
              className={cn(
                'text-foreground truncate cursor-pointer',
                titleClassName,
                {
                  'font-medium': hasDescription,
                },
              )}
              onClick={(e) => {
                e.preventDefault();
                onTitleClick(row.original);
              }}
              data-testid={`${finalTestId}-title-link`}
            >
              {title}
            </a>
            {hasDescription && description && (
              <span
                className={cn(
                  'text-muted-foreground w-full truncate',
                  descriptionClassName,
                )}
              >
                {description}
              </span>
            )}
          </div>
        );
      }

      return (
        <div
          {...createContainerProps({
            className:
              className instanceof Function
                ? className(row.original)
                : className,
            testId: finalTestId,
            entity: row.original,
          })}
        >
          <EntityTitle
            title={title}
            description={description}
            titleClassName={titleClassName}
            descriptionClassName={descriptionClassName}
            hasDescription={hasDescription}
          />
        </div>
      );
    },
  };
}

export function createExpandRowColumn<T extends BaseEntity>(
  t: (key: string) => string,
): ColumnDef<T> {
  return {
    id: 'expand',
    header: t('common.details'),
    cell: ({ row }) => (
      <Button
        variant="ghost"
        className="-ml-2"
        size="sm"
        onClick={() => row.toggleExpanded()}
      >
        {t('common.expand')}{' '}
        {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  };
}

// -------------------- TEXT COLUMN --------------------
interface TextCellColumnOptions<
  K = never,
  B = unknown,
> extends BaseColumnOptions<B> {
  headerKey: string;
  fallbackValue?: string;
  translationPrefix?: string;
  getEntityValue?: K extends never ? never : (entity: K) => string | ReactNode;
  selfAccessor?: boolean;
}

export function createTextColumn<
  T extends BaseEntity,
  K = never,
  TKey extends keyof T = keyof T,
>(
  t: (key: string) => string,
  options: TextCellColumnOptions<K, T> & { accessorKey: TKey },
): ColumnDef<T> {
  const {
    accessorKey,
    headerKey,
    translationPrefix,
    className = '',
    testId,
    fallbackValue = 'N/A',
    getEntityValue,
    selfAccessor,
  } = options;
  const finalTestId = testId || `table-column-${String(accessorKey)}`;

  return {
    accessorKey,
    header: ({ column }) => sortableHeader(column, t(headerKey), false),
    cell: ({ row }) => {
      const entity = selfAccessor ? row.original : row.original[accessorKey];
      const value =
        entity && getEntityValue
          ? getEntityValue(entity as K)
          : (row.getValue(accessorKey as string) ?? fallbackValue);

      return (
        <div
          {...createContainerProps({
            className:
              className instanceof Function
                ? className(row.original)
                : className,
            testId: finalTestId,
            entity: row.original,
          })}
        >
          {translationPrefix && typeof value === 'string'
            ? t(`${translationPrefix}.${value}`)
            : (value as string)}
        </div>
      );
    },
  };
}

// -------------------- DATE COLUMN --------------------
interface DateColumnOptions<T> extends BaseColumnOptions<T> {
  headerKey: string;
  formatFn?: (dateValue: string | Date) => string;
}

export function createDateColumn<T extends BaseEntity>(
  t: (key: string) => string,
  options: DateColumnOptions<T> & { accessorKey: keyof T },
): ColumnDef<T> {
  const { accessorKey, headerKey, formatFn, className = '', testId } = options;
  const finalTestId = testId || `table-column-${String(accessorKey)}`;
  const { formatDateTime } = useDateFormat();

  return {
    accessorKey,
    id: t(headerKey),
    sortingFn: sortInternDate,
    header: ({ column }) => sortableHeader(column, t(headerKey), false),
    cell: ({ row }) => {
      const dateValue = row.original[accessorKey] as unknown as string | Date;
      const formattedDate = formatFn
        ? formatFn(dateValue)
        : formatDateTime(dateValue);

      return (
        <div
          {...createContainerProps({
            className:
              className instanceof Function
                ? className(row.original)
                : className,
            testId: finalTestId,
            entity: row.original,
          })}
        >
          {formattedDate}
        </div>
      );
    },
    filterFn: filterInternDate,
  };
}

// -------------------- UPDATE COLUMN --------------------
export function createUpdateColumn<T extends BaseEntity>(
  t: (key: string) => string,
  options: { className?: string; testId?: string; headerKey?: string } = {},
): ColumnDef<T> {
  return createDateColumn<T>(t, {
    accessorKey: 'updatedAt' as keyof T,
    headerKey: options.headerKey ?? 'common.modificationDate',
    className: options.className,
    testId: options.testId ?? 'table-column-updatedAt',
  });
}

// -------------------- COUNT COLUMN --------------------
export function createCountColumn<T extends BaseEntity>(
  t: (key: string, opts?: object) => string,
  options: BaseColumnOptions & { accessorKey: keyof T; headerKey: string },
): ColumnDef<T> {
  const { accessorKey, headerKey, className = '', testId } = options;
  const finalTestId = testId || `table-column-${String(accessorKey)}`;

  return {
    accessorKey,
    header: t(headerKey),
    cell: ({ row }) => (
      <div
        {...createContainerProps({
          className:
            className instanceof Function ? className(row.original) : className,
          testId: finalTestId,
          entity: row.original,
        })}
      >
        {row.original[accessorKey] as unknown as number}
      </div>
    ),
  };
}

// -------------------- BADGE COLUMN --------------------
interface BadgeColumnOptions<
  T extends BaseEntity,
> extends BaseColumnOptions<T> {
  headerKey: string;
  fallbackValue?: string;
  getVariant?: (entity: T) => string;
  getLabel?: (entity: T) => string;
  getCustomColor?: (entity: T) => string;
}

export function createBadgeColumn<T extends BaseEntity>(
  t: (key: string) => string,
  options: BadgeColumnOptions<T> & { accessorKey: keyof T },
): ColumnDef<T> {
  const {
    accessorKey,
    headerKey,
    fallbackValue = 'N/A',
    getVariant,
    getLabel,
    getCustomColor,
    className = '',
    testId,
  } = options;
  const finalTestId = testId || `table-column-${String(accessorKey)}`;

  return {
    accessorKey,
    header: t(headerKey),
    cell: ({ row }) => {
      const value = row.original[accessorKey] as unknown as string;
      const variant = getVariant?.(row.original) as any;
      const label = getLabel?.(row.original) ?? value;
      const color = getCustomColor?.(row.original);

      return (
        <Badge
          variant={variant}
          style={color ? { backgroundColor: color } : undefined}
          className={cn(
            className instanceof Function ? className(row.original) : className,
          )}
          data-testid={finalTestId}
        >
          {label}
        </Badge>
      );
    },
  };
}

// -------------------- ACTIONS COLUMN --------------------
/**
 * Crée la colonne "Actions" avec bulk delete et actions par ligne
 */
export function createActionsColumn<T extends BaseEntity>(
  options: ActionsColumnOptions<T>,
): ColumnDef<T> {
  const {
    onDelete,
    onEdit,
    canDelete,
    canEdit,
    shouldShowTrashIcon = true,
  } = options;

  return {
    id: 'actions',
    header: ({ table }) => {
      const selectedIds = table
        .getSelectedRowModel()
        .rows.map((row) => row.original.id);
      if (selectedIds.length === 0 || !shouldShowTrashIcon) return null;

      return (
        <div className="w-10 mx-auto flex justify-center">
          <Button
            className="p-1 h-8 w-8 rounded-full"
            variant="destructive"
            size="sm"
            onClick={() =>
              onDelete(selectedIds, () => table.resetRowSelection())
            }
          >
            <Trash2 size={16} />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const entity = row.original;

      return (
        <div className="w-10 mx-auto flex justify-center">
          <EntityActionsMenu
            entity={entity}
            canDelete={canDelete ? canDelete(entity) : true}
            canEdit={canEdit ? canEdit(entity) : true}
            onDelete={(id: string) => onDelete([id])}
            onEdit={onEdit}
            customActions={options.customActions}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 60,
    maxSize: 80,
  };
}
