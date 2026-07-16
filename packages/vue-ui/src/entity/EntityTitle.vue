<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  title: string;
  description?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  hasDescription?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  titleClassName: '',
  descriptionClassName: '',
  hasDescription: true,
});

const titleClasses = computed(() =>
  cn(
    'truncate text-foreground',
    props.titleClassName,
    props.hasDescription && 'font-medium',
  ),
);
const descriptionClasses = computed(() =>
  cn('w-full truncate text-muted-foreground', props.descriptionClassName),
);
</script>

<template>
  <div class="flex w-full flex-col">
    <span :class="titleClasses" data-testid="entity-title">{{ title }}</span>
    <span v-if="hasDescription && description" :class="descriptionClasses" data-testid="entity-description">
      {{ description }}
    </span>
  </div>
</template>
