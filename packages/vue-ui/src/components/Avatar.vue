<script setup lang="ts">
import { AvatarRoot } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() =>
  cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', props.className),
);
</script>

<template>
  <AvatarRoot data-slot="avatar" :class="classes">
    <slot />
  </AvatarRoot>
</template>
