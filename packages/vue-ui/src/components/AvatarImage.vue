<script setup lang="ts">
import { AvatarImage as RekaAvatarImage } from 'reka-ui';
import { computed } from 'vue';
import { cn } from '../lib/cn';

interface Props {
  src: string;
  alt?: string;
  className?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{ error: [] }>();
const classes = computed(() => cn('aspect-square size-full', props.className));
</script>

<template>
  <RekaAvatarImage
    data-slot="avatar-image"
    :class="classes"
    :src="src"
    :alt="alt"
    @loading-status-change="(status) => status === 'error' && emit('error')"
  />
</template>
