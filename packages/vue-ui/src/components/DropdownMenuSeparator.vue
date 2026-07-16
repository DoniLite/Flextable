<script setup lang="ts">
import { DropdownMenuSeparator as RekaDropdownMenuSeparator } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('-mx-1 my-1 h-px bg-border', props.className));
</script>

<template>
  <RekaDropdownMenuSeparator data-slot="dropdown-menu-separator" :class="classes" />
</template>
