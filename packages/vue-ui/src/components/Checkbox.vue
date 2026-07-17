<script setup lang="ts">
import { CheckIcon } from '@lucide/vue';
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  checked?: boolean;
  className?: string;
  'aria-label'?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:checked': [value: boolean] }>();

const classes = computed(() =>
  cn(
    'peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
    props.className,
  ),
);
</script>

<template>
  <CheckboxRoot
    data-slot="checkbox"
    :class="classes"
    :model-value="checked"
    :aria-label="props['aria-label']"
    @update:model-value="(value) => emit('update:checked', value === true)"
  >
    <CheckboxIndicator data-slot="checkbox-indicator" class="grid place-content-center text-current">
      <CheckIcon class="size-3.5" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
