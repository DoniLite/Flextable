<script setup lang="ts" generic="TData">
import type { TranslateFn } from '@flextable/core';
import { DEFAULT_FLEXTABLE_KEYS } from '@flextable/core';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@flextable/vue-ui';
import type { Row, Table } from '@tanstack/vue-table';
import { computed, ref } from 'vue';

export interface GenericRowDetailProps<TData> {
  row: Row<TData>;
  table: Table<TData>;
  t: TranslateFn;
  keys?: Array<keyof TData>;
  excludedKeys?: Array<keyof TData>;
  titleKey?: string;
  showLessKey?: string;
  showMoreKey?: string;
}

const props = withDefaults(defineProps<GenericRowDetailProps<TData>>(), {
  titleKey: () => DEFAULT_FLEXTABLE_KEYS.details,
  showLessKey: () => DEFAULT_FLEXTABLE_KEYS.showLess,
  showMoreKey: () => DEFAULT_FLEXTABLE_KEYS.showMore,
});

const displayKeys = computed(() => {
  const data = props.row.original;
  const allKeys = props.keys ?? (Object.keys(data as object) as Array<keyof TData>);
  return props.excludedKeys
    ? allKeys.filter((key) => !props.excludedKeys?.includes(key))
    : allKeys;
});

const MAX_LENGTH = 150;

function valueDisplay(value: unknown, expanded: boolean) {
  const stringValue =
    typeof value === 'object' && value !== null
      ? JSON.stringify(value, null, 2)
      : String(value ?? '');
  const isLong = stringValue.length > MAX_LENGTH;
  const displayValue =
    isLong && !expanded ? `${stringValue.slice(0, MAX_LENGTH)}...` : stringValue;
  return { isObject: typeof value === 'object' && value !== null, isLong, displayValue };
}

const expandedKeys = ref(new Set<string>());
function toggleExpanded(key: string) {
  if (expandedKeys.value.has(key)) expandedKeys.value.delete(key);
  else expandedKeys.value.add(key);
}
</script>

<template>
  <Card class="m-4">
    <CardHeader>
      <CardTitle>{{ t(titleKey) }}</CardTitle>
    </CardHeader>
    <CardContent class="grid grid-cols-1 gap-4 @md:grid-cols-2 @lg:grid-cols-3">
      <div v-for="key in displayKeys" :key="String(key)" class="flex flex-col gap-1">
        <span class="font-medium text-muted-foreground text-sm capitalize">{{ String(key) }}</span>
        <div class="flex flex-col items-start gap-1">
          <pre
            v-if="valueDisplay(row.original[key], expandedKeys.has(String(key))).isObject"
            class="w-full whitespace-pre-wrap break-all rounded-md bg-muted p-2 font-mono text-sm"
            >{{ valueDisplay(row.original[key], expandedKeys.has(String(key))).displayValue }}</pre
          >
          <span v-else class="whitespace-pre-line break-all text-sm">
            {{ valueDisplay(row.original[key], expandedKeys.has(String(key))).displayValue }}
          </span>
          <Button
            v-if="valueDisplay(row.original[key], expandedKeys.has(String(key))).isLong"
            variant="link"
            class-name="h-auto p-0 text-secondary text-xs"
            @click="toggleExpanded(String(key))"
          >
            {{ expandedKeys.has(String(key)) ? t(showLessKey) : t(showMoreKey) }}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
