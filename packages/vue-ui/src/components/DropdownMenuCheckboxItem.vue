<script setup lang="ts">
import { CheckIcon } from 'lucide-vue-next';
import {
  DropdownMenuItemIndicator,
  DropdownMenuCheckboxItem as RekaDropdownMenuCheckboxItem,
} from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  checked?: boolean;
  className?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:checked': [value: boolean] }>();

const classes = computed(() =>
  cn(
    'relative flex cursor-pointer select-none items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground',
    props.className,
  ),
);
</script>

<template>
  <RekaDropdownMenuCheckboxItem
    data-slot="dropdown-menu-checkbox-item"
    :class="classes"
    :model-value="checked"
    @update:model-value="(value) => emit('update:checked', value === true)"
  >
    <span class="absolute left-2 flex size-3.5 items-center justify-center">
      <DropdownMenuItemIndicator>
        <CheckIcon class="size-4" />
      </DropdownMenuItemIndicator>
    </span>
    <slot />
  </RekaDropdownMenuCheckboxItem>
</template>
