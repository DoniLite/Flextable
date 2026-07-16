<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  modelValue?: string;
  type?: string;
  placeholder?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), { type: 'text' });
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const classes = computed(() =>
  cn(
    'flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
    props.className,
  ),
);
</script>

<template>
  <input
    data-slot="input"
    :type="type"
    :placeholder="placeholder"
    :class="classes"
    :value="modelValue"
    @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
