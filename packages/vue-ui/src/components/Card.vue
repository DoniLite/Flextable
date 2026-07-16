<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() =>
  cn('rounded-xl border bg-card text-card-foreground shadow-sm', props.className),
);
</script>

<template>
  <div data-slot="card" :class="classes"><slot /></div>
</template>
