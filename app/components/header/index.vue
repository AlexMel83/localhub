<template>
  <nav class="w-full flex flex-col h-[60px] px-3 pt-2 fixed top-0 z-[1500] bg-transparent">
    <div class="container flex justify-between items-center">
      <div>
        <NuxtLink to="/">
          <NuxtImg src="Localhub-logo-320.jpg" class="h-full max-h-[40px] sm:max-h-[60px] object-contain" />
        </NuxtLink>
      </div>
      <UButton
        class="cursor-pointer hover:text-custom-orange dark:hover:text-custom-orange transition-colors"
        aria-label="Toggle dark mode"
        color="neutral"
        @click="appStore.toggleListView"
      >
        {{ appStore.isListView ? $t('Header.viewMap') : $t('Header.viewList') }}
        <Icon
          :name="`${appStore.isListView ? 'lucide-map' : 'lucide-list'}`"
          class="w-5 h-5 transition-transform duration-300 ease-in-out"
        />
      </UButton>
      <HeaderButtons @toggle-search="toggleSearch" />
    </div>
    <div class="ml-auto">
      <HeaderSearchInput v-if="isSearchVisible" />
    </div>
  </nav>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
const appStore = useAppStore();
const isSearchVisible = ref(false);

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};
</script>
