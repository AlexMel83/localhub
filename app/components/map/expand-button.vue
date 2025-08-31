<template>
  <UButton
    class="accordion-button mb-2 dark:text-gray-900 hover:bg-primary-600 dark:hover:bg-primary-500 absolute top-2 right-2 z-[2] px-2 py-1 rounded shadow-md w-auto max-w-[95px] whitespace-normal sm:max-w-full sm:px-1 sm:text-base text-sm text-left mt-0 xs:mt-0"
    @click="toggleFullScreen"
  >
    {{ isFullScreen ? $t('Map.collapseMap') : $t('Map.expandMap') }}
    <template #trailing>
      <ExpandedIcon v-if="isFullScreen" />
      <CollapsedIcon v-else />
    </template>
  </UButton>
</template>

<script setup>
import { nextTick } from 'vue';
import ExpandedIcon from '~/components/icons/ExpandedIcon.vue';
import CollapsedIcon from '~/components/icons/CollapsedIcon.vue';

const props = defineProps({
  isFullScreen: {
    type: Boolean,
    required: true,
  },
  mapRef: {
    type: Object,
    required: false,
    default: null,
  },
});

const emit = defineEmits(['update:isFullScreen']);

const toggleFullScreen = () => {
  emit('update:isFullScreen', !props.isFullScreen);

  // После изменения размеров карты, нужно вызвать invalidateSize()
  nextTick(() => {
    if (props.mapRef?.leafletObject) {
      props.mapRef.leafletObject.invalidateSize();
    }
  });
};
</script>
