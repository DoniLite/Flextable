<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('flex flex-col gap-1.5 p-6', props.className));
</script>

<template>
  <div data-slot="card-header" :class="classes"><slot /></div>
</template>
