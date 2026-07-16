<script setup lang="ts">
import { computed, ref } from 'vue';
import Avatar from '../components/Avatar.vue';
import AvatarImage from '../components/AvatarImage.vue';
import { cn, getInitials } from '../lib/cn';

interface Props {
  image?: string | null;
  name?: string | null;
  isSelected?: boolean;
  fallbackText?: string;
  altText?: string;
  className?: string;
}

const props = defineProps<Props>();
const imageHasError = ref(false);

const computedFallbackText = computed(() =>
  getInitials(props.name || props.fallbackText || '?'),
);

const imageIsUsable = computed(() => {
  const { image } = props;
  if (!image) return false;
  return image.startsWith('http') || image.startsWith('data:image');
});

const avatarClass = computed(() =>
  cn(props.isSelected ? 'border-2 border-primary' : '', props.className),
);
</script>

<template>
  <Avatar :class-name="avatarClass">
    <AvatarImage
      v-if="image && imageIsUsable && !imageHasError"
      :src="image"
      :alt="altText || `${name || 'Entity'} avatar`"
      @error="imageHasError = true"
    />
    <div v-else class="flex size-full items-center justify-center rounded-full bg-muted" data-slot="avatar-fallback">
      {{ computedFallbackText }}
    </div>
  </Avatar>
</template>
