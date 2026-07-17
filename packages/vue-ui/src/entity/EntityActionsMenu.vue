<script setup lang="ts" generic="T extends { id: string | number }">
import type { CustomActionConfig } from '@flextable/core';
import { EllipsisVertical } from '@lucide/vue';
import { DropdownMenuRoot as DropdownMenu } from 'reka-ui';
import type { VNode } from 'vue';
import { computed } from 'vue';
import type { ButtonVariant } from '../components/Button.vue';
import Button from '../components/Button.vue';
import DropdownMenuContent from '../components/DropdownMenuContent.vue';
import DropdownMenuItem from '../components/DropdownMenuItem.vue';
import DropdownMenuLabel from '../components/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../components/DropdownMenuSeparator.vue';
import DropdownMenuTrigger from '../components/DropdownMenuTrigger.vue';

export interface EntityActionsMenuProps<T extends { id: string | number }> {
  entity: T;
  actionsLabel: string;
  editLabel: string;
  deleteLabel: string;
  canEdit?: boolean;
  canDelete?: boolean;
  customActions?: Array<CustomActionConfig<T> & { icon?: VNode }>;
}

const props = withDefaults(defineProps<EntityActionsMenuProps<T>>(), {
  canEdit: true,
  canDelete: true,
  customActions: () => [],
});

const emit = defineEmits<{ edit: [entity: T]; delete: [id: T['id']] }>();

const BUTTON_VARIANTS = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
] as const;

function toButtonVariant(value: string | undefined): ButtonVariant {
  return (BUTTON_VARIANTS as ReadonlyArray<string>).includes(value ?? '')
    ? (value as ButtonVariant)
    : 'ghost';
}

const visibleCustomActions = computed(() =>
  props.customActions.filter(
    (action) => !action.isVisible || action.isVisible(props.entity),
  ),
);

function actionLabel(action: CustomActionConfig<T>): string {
  return typeof action.label === 'function' ? action.label(props.entity) : action.label;
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        :disabled="!canEdit && !canDelete"
        variant="ghost"
        class-name="h-8 w-8 p-0"
        data-testid="actions-dropdown"
      >
        <EllipsisVertical class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuLabel>{{ actionsLabel }}</DropdownMenuLabel>
      <DropdownMenuSeparator />

      <DropdownMenuItem
        v-for="(action, index) in visibleCustomActions"
        :key="index"
        as-child
        @select="action.onClick(entity)"
      >
        <Button
          :variant="toButtonVariant(action.variant)"
          :class-name="`mb-1 flex h-[99%] w-full cursor-pointer justify-start gap-2 ${action.className ?? ''}`"
        >
          <component :is="action.icon" v-if="action.icon" />
          {{ actionLabel(action) }}
        </Button>
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="visibleCustomActions.length > 0" />

      <DropdownMenuItem v-if="canEdit" as-child data-testid="edit-menu-item" @select="emit('edit', entity)">
        <Button variant="ghost" class-name="mb-1 flex h-[99%] w-full cursor-pointer justify-start">
          {{ editLabel }}
        </Button>
      </DropdownMenuItem>

      <DropdownMenuItem
        v-if="canDelete"
        as-child
        data-testid="delete-menu-item"
        @select="emit('delete', entity.id)"
      >
        <Button
          variant="ghost"
          class-name="flex h-[99%] w-full cursor-pointer justify-start text-destructive focus:text-destructive"
        >
          {{ deleteLabel }}
        </Button>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
