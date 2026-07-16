<script setup lang="ts">
import { AvatarFallback as RekaAvatarFallback } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  className?: string;
}

const props = defineProps<Props>();
const classes = computed(() =>
  cn('flex size-full items-center justify-center rounded-full bg-muted', props.className),
);
</script>

<template>
  <RekaAvatarFallback data-slot="avatar-fallback" :class="classes">
    <slot />
  </RekaAvatarFallback>
</template>
