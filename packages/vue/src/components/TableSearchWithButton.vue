<script setup lang="ts">
import type { FlexTableKeys, TranslateFn } from '@flextable/core';
import { cn, Input } from '@flextable/vue-ui';
import { Search, X } from 'lucide-vue-next';
import { computed, inject, ref, useId, watch } from 'vue';
import { TABLE_LOADING_STATE_KEY } from '../composables/tableLoadingState';
import { useDebounceFn } from '../composables/useDebounceFn';

interface Props {
  t: TranslateFn;
  keys: FlexTableKeys;
  className?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ update: [value: string] }>();

const searchValue = ref('');
const isLoading = inject(
  TABLE_LOADING_STATE_KEY,
  computed(() => false),
);
const canSearch = computed(() => searchValue.value.length > 0);

function handleSearch() {
  if (isLoading.value) return;
  emit('update', searchValue.value);
}

function onClear() {
  searchValue.value = '';
}

const debouncedSetFilter = useDebounceFn((value: string) => {
  if (!value) handleSearch();
}, 200);

watch(searchValue, (value) => debouncedSetFilter(value));
</script>

<template>
  <div :class="cn('relative w-full items-center rounded-lg border', props.className)">
    <div class="relative flex-1">
      <Input
        :id="useId()"
        v-model="searchValue"
        type="text"
        :placeholder="t(keys.search)"
        class-name="w-full pr-15 pl-10 @md:pr-20"
        @keyup="() => searchValue && handleSearch()"
      />
      <span class="absolute inset-y-0 start-0 flex items-center justify-center px-2">
        <Search v-if="!canSearch" class="h-4 w-4 text-muted-foreground" />
        <button v-else type="button" class="focus:outline-none" @click="onClear">
          <X class="h-4 w-4 text-muted-foreground" />
        </button>
      </span>
    </div>
  </div>
</template>
