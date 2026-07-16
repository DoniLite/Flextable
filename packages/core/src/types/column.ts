import type { ClassNameProp } from '../helpers/className';
import type { EntityLike } from './entity';
import type { FlexTableKeys } from './keys';

export interface BaseColumnMeta<T> {
  id?: string;
  testId?: string;
  className?: ClassNameProp<T>;
}

export interface SelectColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'select';
  selectAllLabel: string;
  selectRowLabel: string;
}

export interface AvatarColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'avatar';
  accessorKey: keyof T;
  headerLabel: string;
  getImage: (entity: T) => string | null | undefined;
  getName: (entity: T) => string | undefined;
}

export interface NameColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'name';
  accessorKey: keyof T;
  headerLabel: string;
  hasDescription: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  getTitle: (entity: T) => string;
  getDescription?: (entity: T) => string | undefined;
  onTitleClick?: (entity: T) => void;
}

export interface TextColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'text';
  accessorKey: keyof T;
  headerLabel: string;
  fallbackValue: string;
  translationPrefix?: string;
  getValue?: (entity: T) => string;
}

export interface DateColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'date';
  accessorKey: keyof T;
  headerLabel: string;
  formatDate: (value: string | Date) => string;
}

export interface CountColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'count';
  accessorKey: keyof T;
  headerLabel: string;
}

export interface BadgeColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'badge';
  accessorKey: keyof T;
  headerLabel: string;
  fallbackValue: string;
  getVariant?: (entity: T) => string;
  getLabel?: (entity: T) => string;
  getCustomColor?: (entity: T) => string | undefined;
}

export interface CustomActionConfig<T> {
  label: string | ((entity: T) => string);
  onClick: (entity: T) => void;
  icon?: unknown;
  variant?: string;
  className?: string;
  isVisible?: (entity: T) => boolean;
}

export interface ActionsColumnConfig<T extends EntityLike> extends BaseColumnMeta<T> {
  kind: 'actions';
  onDelete: (ids: Array<T['id']>, resetSelection?: () => void) => void;
  onEdit: (entity: T) => void;
  canDelete?: (entity: T) => boolean;
  canEdit?: (entity: T) => boolean;
  shouldShowTrashIcon: boolean;
  customActions?: Array<CustomActionConfig<T>>;
}

export interface ExpandRowColumnConfig<T> extends BaseColumnMeta<T> {
  kind: 'expandRow';
  headerLabel: string;
}

/** Escape hatch for column kinds `ColumnFactory` doesn't ship a builder for — see `registerColumnType`. */
export interface CustomColumnConfig<T, TOptions = unknown> extends BaseColumnMeta<T> {
  kind: string;
  options: TOptions;
}

export type ColumnConfig<T extends EntityLike> =
  | SelectColumnConfig<T>
  | AvatarColumnConfig<T>
  | NameColumnConfig<T>
  | TextColumnConfig<T>
  | DateColumnConfig<T>
  | CountColumnConfig<T>
  | BadgeColumnConfig<T>
  | ActionsColumnConfig<T>
  | ExpandRowColumnConfig<T>
  | CustomColumnConfig<T>;

export interface ColumnFactoryDefaults {
  fallbackValue?: string;
  keys?: Partial<FlexTableKeys>;
}
