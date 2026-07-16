<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() =>
  cn(
    'h-12 whitespace-nowrap px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
    props.className,
  ),
);
</script>

<template>
  <th data-slot="table-head" :class="classes"><slot /></th>
</template>
