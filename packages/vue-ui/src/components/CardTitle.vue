<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('font-semibold leading-none', props.className));
</script>

<template>
  <div data-slot="card-title" :class="classes"><slot /></div>
</template>
