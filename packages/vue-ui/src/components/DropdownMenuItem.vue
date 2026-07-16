<script setup lang="ts">
import { DropdownMenuItem as RekaDropdownMenuItem } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
  asChild?: boolean;
}

const props = withDefaults(defineProps<Props>(), { asChild: false });
const emit = defineEmits<{ select: [] }>();

const classes = computed(() =>
  cn(
    'relative flex cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-accent focus:text-accent-foreground',
    props.className,
  ),
);
</script>

<template>
  <RekaDropdownMenuItem
    data-slot="dropdown-menu-item"
    :as-child="asChild"
    :class="classes"
    @select="emit('select')"
  >
    <slot />
  </RekaDropdownMenuItem>
</template>
