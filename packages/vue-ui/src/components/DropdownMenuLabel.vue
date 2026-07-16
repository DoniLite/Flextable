<script setup lang="ts">
import { DropdownMenuLabel as RekaDropdownMenuLabel } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('px-2 py-1.5 text-sm font-medium', props.className));
</script>

<template>
  <RekaDropdownMenuLabel data-slot="dropdown-menu-label" :class="classes">
    <slot />
  </RekaDropdownMenuLabel>
</template>
