<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
  colspan?: number;
}

const props = defineProps<Props>();
const classes = computed(() =>
  cn('px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0', props.className),
);
</script>

<template>
  <td data-slot="table-cell" :class="classes" :colspan="colspan"><slot /></td>
</template>
