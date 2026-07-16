<script setup lang="ts">
import { DropdownMenuTrigger as RekaDropdownMenuTrigger } from 'reka-ui';

interface Props {
  asChild?: boolean;
}

withDefaults(defineProps<Props>(), { asChild: false });
</script>

<template>
  <RekaDropdownMenuTrigger :as-child="asChild">
    <slot />
  </RekaDropdownMenuTrigger>
</template>
