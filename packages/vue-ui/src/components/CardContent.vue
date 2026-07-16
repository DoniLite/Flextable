<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('p-6 pt-0', props.className));
</script>

<template>
  <div data-slot="card-content" :class="classes"><slot /></div>
</template>
