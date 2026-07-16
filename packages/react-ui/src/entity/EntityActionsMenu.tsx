import type { CustomActionConfig } from '@flextable/core';
import { EllipsisVertical } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ButtonProps } from '../components/Button';
import { Button } from '../components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/DropdownMenu';
import { cn } from '../lib/cn';

const BUTTON_VARIANTS = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
] as const;

function toButtonVariant(value: string | undefined): ButtonProps['variant'] {
  return (BUTTON_VARIANTS as ReadonlyArray<string>).includes(value ?? '')
    ? (value as ButtonProps['variant'])
    : 'ghost';
}

export interface EntityActionsMenuProps<T extends { id: string | number }> {
  entity: T;
  actionsLabel: string;
  editLabel: string;
  deleteLabel: string;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (entity: T) => void;
  onDelete?: (id: T['id']) => void;
  customActions?: Array<CustomActionConfig<T> & { icon?: ReactNode }>;
}

/** Generalized from obaas-frontend's shared/entity/ActionDropdown.tsx — labels are now props instead of hardcoded i18n keys. */
export function EntityActionsMenu<T extends { id: string | number }>({
  entity,
  actionsLabel,
  editLabel,
  deleteLabel,
  canEdit = true,
  canDelete = true,
  onEdit,
  onDelete,
  customActions,
}: EntityActionsMenuProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={!canEdit && !canDelete}
          variant="ghost"
          className="h-8 w-8 p-0"
          data-testid="actions-dropdown"
        >
          <EllipsisVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{actionsLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {customActions?.map((action, index) => {
          if (action.isVisible && !action.isVisible(entity)) return null;
          return (
            <DropdownMenuItem
              key={`action-${String(index)}`}
              asChild
              onClick={() => action.onClick(entity)}
            >
              <Button
                variant={toButtonVariant(action.variant)}
                className={cn(
                  'mb-1 flex h-[99%] w-full cursor-pointer justify-start gap-2',
                  action.className,
                )}
              >
                {action.icon}
                {typeof action.label === 'function' ? action.label(entity) : action.label}
              </Button>
            </DropdownMenuItem>
          );
        })}
        {customActions && customActions.length > 0 && <DropdownMenuSeparator />}

        {canEdit && (
          <DropdownMenuItem
            asChild
            data-testid="edit-menu-item"
            onClick={() => onEdit?.(entity)}
          >
            <Button
              variant="ghost"
              className="mb-1 flex h-[99%] w-full cursor-pointer justify-start"
            >
              {editLabel}
            </Button>
          </DropdownMenuItem>
        )}

        {canDelete && (
          <DropdownMenuItem
            asChild
            data-testid="delete-menu-item"
            onClick={() => onDelete?.(entity.id)}
          >
            <Button
              variant="ghost"
              className="flex h-[99%] w-full cursor-pointer justify-start text-destructive focus:text-destructive"
            >
              {deleteLabel}
            </Button>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
