<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('[&_tr]:border-b', props.className));
</script>

<template>
  <thead data-slot="table-header" :class="classes"><slot /></thead>
</template>
