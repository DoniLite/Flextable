<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() => cn('[&_tr:last-child]:border-0', props.className));
</script>

<template>
  <tbody data-slot="table-body" :class="classes"><slot /></tbody>
</template>
