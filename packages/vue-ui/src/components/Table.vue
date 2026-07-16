<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
  /** Additive override for the scroll wrapper `<div>` around `<table>` (not the table itself — use `className` for that). */
  wrapperClassName?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('w-full caption-bottom text-sm', props.className));
const wrapperClasses = computed(() =>
  cn('relative w-full overflow-x-auto', props.wrapperClassName),
);
</script>

<template>
  <div :class="wrapperClasses">
    <table data-slot="table" :class="classes"><slot /></table>
  </div>
</template>
