import type { ClassNameProp } from '../helpers/className';
import type {
  ActionsColumnConfig,
  AvatarColumnConfig,
  BadgeColumnConfig,
  ColumnFactoryDefaults,
  CountColumnConfig,
  CustomActionConfig,
  CustomColumnConfig,
  DateColumnConfig,
  ExpandRowColumnConfig,
  NameColumnConfig,
  SelectColumnConfig,
  TextColumnConfig,
} from '../types/column';
import type { EntityLike } from '../types/entity';
import type { TranslateFn } from '../types/i18n';
import type { FlexTableKeys } from '../types/keys';
import { resolveFlexTableKeys } from '../types/keys';

export interface CommonColumnOptions<T> {
  testId?: string;
  className?: ClassNameProp<T>;
}

export interface AvatarColumnOptions<T> extends CommonColumnOptions<T> {
  accessorKey: keyof T;
  headerKey?: string;
  getImage?: (entity: T) => string | null | undefined;
  getName: (entity: T) => string | undefined;
}

export interface NameColumnOptions<T> extends CommonColumnOptions<T> {
  accessorKey: keyof T;
  headerKey?: string;
  hasDescription?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
  getTitle: (entity: T) => string;
  getDescription?: (entity: T) => string | undefined;
  onTitleClick?: (entity: T) => void;
}

export interface TextColumnOptions<T> extends CommonColumnOptions<T> {
  accessorKey: keyof T;
  headerKey: string;
  fallbackValue?: string;
  translationPrefix?: string;
  getValue?: (entity: T) => string;
}

export interface DateColumnOptions<T> extends CommonColumnOptions<T> {
  accessorKey: keyof T;
  headerKey: string;
  formatDate: (value: string | Date) => string;
}

export interface CountColumnOptions<T> extends CommonColumnOptions<T> {
  accessorKey: keyof T;
  headerKey: string;
}

export interface BadgeColumnOptions<T, TVariant extends string = string>
  extends CommonColumnOptions<T> {
  accessorKey: keyof T;
  headerKey: string;
  fallbackValue?: string;
  getVariant?: (entity: T) => TVariant;
  getLabel?: (entity: T) => string;
  getCustomColor?: (entity: T) => string | undefined;
}

export interface ActionsColumnOptions<T extends EntityLike>
  extends CommonColumnOptions<T> {
  onDelete: (ids: Array<T['id']>, resetSelection?: () => void) => void;
  onEdit: (entity: T) => void;
  canDelete?: (entity: T) => boolean;
  canEdit?: (entity: T) => boolean;
  shouldShowTrashIcon?: boolean;
  customActions?: Array<CustomActionConfig<T>>;
}

type ColumnTypeBuilder<TOptions, TResolved> = (
  t: TranslateFn,
  options: TOptions,
) => TResolved;

/**
 * OOP column registry replacing the old fixed set of exported factory
 * functions. `t` and shared defaults are captured once; every builder method
 * returns a framework-agnostic `ColumnConfig` descriptor that `@flextable/react`
 * and `@flextable/vue` each translate into a real `ColumnDef` with their own
 * renderers. Unknown column kinds can be added via `registerColumnType`
 * without forking the library.
 */
export class ColumnFactory<TEntity extends EntityLike> {
  #t: TranslateFn;
  #defaults: { fallbackValue: string };
  #keys: FlexTableKeys;
  #customBuilders = new Map<string, ColumnTypeBuilder<unknown, unknown>>();

  constructor(t: TranslateFn, defaults: ColumnFactoryDefaults = {}) {
    this.#t = t;
    this.#defaults = { fallbackValue: defaults.fallbackValue ?? 'N/A' };
    this.#keys = resolveFlexTableKeys(defaults.keys);
  }

  select(options: CommonColumnOptions<TEntity> = {}): SelectColumnConfig<TEntity> {
    return {
      kind: 'select',
      id: 'select',
      selectAllLabel: this.#t(this.#keys.selectAll),
      selectRowLabel: this.#t(this.#keys.checkboxLabel),
      testId: options.testId,
      className: options.className,
    };
  }

  avatar(options: AvatarColumnOptions<TEntity>): AvatarColumnConfig<TEntity> {
    const {
      accessorKey,
      headerKey = this.#keys.avatar,
      getName,
      testId,
      className,
    } = options;
    return {
      kind: 'avatar',
      accessorKey,
      headerLabel: this.#t(headerKey),
      getImage:
        options.getImage ?? ((entity) => entity[accessorKey] as unknown as string),
      getName,
      testId: testId ?? `table-column-${String(accessorKey)}`,
      className,
    };
  }

  name(options: NameColumnOptions<TEntity>): NameColumnConfig<TEntity> {
    const {
      accessorKey,
      headerKey,
      hasDescription = true,
      testId,
      titleClassName,
      descriptionClassName,
      getTitle,
      getDescription,
      onTitleClick,
      className,
    } = options;
    const label = headerKey ? this.#t(headerKey) : this.#t(this.#keys.name);
    return {
      kind: 'name',
      accessorKey,
      id: label,
      headerLabel: label,
      hasDescription,
      titleClassName,
      descriptionClassName,
      getTitle,
      getDescription,
      onTitleClick,
      testId: testId ?? `table-column-${String(accessorKey)}`,
      className,
    };
  }

  text(options: TextColumnOptions<TEntity>): TextColumnConfig<TEntity> {
    const {
      accessorKey,
      headerKey,
      translationPrefix,
      testId,
      fallbackValue = this.#defaults.fallbackValue,
      getValue,
      className,
    } = options;
    return {
      kind: 'text',
      accessorKey,
      headerLabel: this.#t(headerKey),
      fallbackValue,
      translationPrefix,
      getValue,
      testId: testId ?? `table-column-${String(accessorKey)}`,
      className,
    };
  }

  date(options: DateColumnOptions<TEntity>): DateColumnConfig<TEntity> {
    const { accessorKey, headerKey, formatDate, testId, className } = options;
    return {
      kind: 'date',
      accessorKey,
      id: this.#t(headerKey),
      headerLabel: this.#t(headerKey),
      formatDate,
      testId: testId ?? `table-column-${String(accessorKey)}`,
      className,
    };
  }

  /** Convenience wrapper around `date()` defaulting to the `updatedAt` accessor. */
  updated(
    options: Omit<DateColumnOptions<TEntity>, 'accessorKey' | 'headerKey'> & {
      accessorKey?: keyof TEntity;
      headerKey?: string;
    },
  ): DateColumnConfig<TEntity> {
    return this.date({
      ...options,
      accessorKey: options.accessorKey ?? ('updatedAt' as keyof TEntity),
      headerKey: options.headerKey ?? this.#keys.modificationDate,
      testId: options.testId ?? 'table-column-updatedAt',
    });
  }

  count(options: CountColumnOptions<TEntity>): CountColumnConfig<TEntity> {
    const { accessorKey, headerKey, testId, className } = options;
    return {
      kind: 'count',
      accessorKey,
      headerLabel: this.#t(headerKey),
      testId: testId ?? `table-column-${String(accessorKey)}`,
      className,
    };
  }

  badge<TVariant extends string = string>(
    options: BadgeColumnOptions<TEntity, TVariant>,
  ): BadgeColumnConfig<TEntity> {
    const {
      accessorKey,
      headerKey,
      fallbackValue = this.#defaults.fallbackValue,
      getVariant,
      getLabel,
      getCustomColor,
      testId,
      className,
    } = options;
    return {
      kind: 'badge',
      accessorKey,
      headerLabel: this.#t(headerKey),
      fallbackValue,
      getVariant,
      getLabel,
      getCustomColor,
      testId: testId ?? `table-column-${String(accessorKey)}`,
      className,
    };
  }

  actions(options: ActionsColumnOptions<TEntity>): ActionsColumnConfig<TEntity> {
    const {
      onDelete,
      onEdit,
      canDelete,
      canEdit,
      shouldShowTrashIcon = true,
      customActions,
      testId,
      className,
    } = options;
    return {
      kind: 'actions',
      id: 'actions',
      onDelete,
      onEdit,
      canDelete,
      canEdit,
      shouldShowTrashIcon,
      customActions,
      testId,
      className,
    };
  }

  expandRow(options: CommonColumnOptions<TEntity> = {}): ExpandRowColumnConfig<TEntity> {
    return {
      kind: 'expandRow',
      id: 'expand',
      headerLabel: this.#t(this.#keys.details),
      testId: options.testId,
      className: options.className,
    };
  }

  /**
   * Plugin escape hatch: register a builder for a column kind this class
   * doesn't ship (e.g. "currency"). `builder` receives `t` and the caller's
   * options and resolves them into whatever props the framework renderer
   * registered for `kind` expects — `custom()` wraps the result.
   */
  registerColumnType<TOptions, TResolved = TOptions>(
    kind: string,
    builder: ColumnTypeBuilder<TOptions, TResolved>,
  ): void {
    this.#customBuilders.set(kind, builder as ColumnTypeBuilder<unknown, unknown>);
  }

  custom<TResolved = unknown, TOptions = unknown>(
    kind: string,
    options: TOptions,
  ): CustomColumnConfig<TEntity, TResolved> {
    const builder = this.#customBuilders.get(kind) as
      | ColumnTypeBuilder<TOptions, TResolved>
      | undefined;
    if (!builder) {
      throw new Error(
        `ColumnFactory: no column type registered for kind "${kind}". Call registerColumnType() first.`,
      );
    }
    return { kind, options: builder(this.#t, options) };
  }
}
