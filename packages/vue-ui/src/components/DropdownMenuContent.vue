<script setup lang="ts">
import {
  DropdownMenuPortal,
  DropdownMenuContent as RekaDropdownMenuContent,
} from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  align?: 'start' | 'center' | 'end';
  className?: string;
  sideOffset?: number;
}

const props = withDefaults(defineProps<Props>(), { align: 'center', sideOffset: 4 });

const classes = computed(() =>
  cn(
    'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
    props.className,
  ),
);
</script>

<template>
  <DropdownMenuPortal>
    <RekaDropdownMenuContent data-slot="dropdown-menu-content" :align="align" :side-offset="sideOffset" :class="classes">
      <slot />
    </RekaDropdownMenuContent>
  </DropdownMenuPortal>
</template>
