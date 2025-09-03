<script setup>
import { useAppStore } from '~/stores/app.store';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
const route = useRoute();
const isSearchVisible = ref(false);

// Перевіряємо, чи поточна сторінка є головною (наприклад, '/')
const isHomePage = computed(() => {
  return route.path === '/' || /^\/[a-z]{2}\/?$/.test(route.path);
});

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};
</script>

<template>
  <nav
    :class="[
      'w-full flex flex-col h-[60px] px-3 pt-2 fixed top-0 z-[1500]',
      isHomePage && !appStore.isListView ? 'bg-transparent' : 'relative',
    ]"
  >
    <div class="w-full flex justify-between items-center">
      <div>
        <NuxtLink to="/">
          <NuxtImg src="Localhub-logo-320.jpg" class="h-full mr-auto max-h-[40px] sm:max-h-[60px] object-contain" />
        </NuxtLink>
      </div>
      <div class="flex items-center gap-4">
        <!-- Кнопка перемикання вигляду відображається тільки на головній сторінці -->
        <UButton
          v-if="isHomePage"
          class="cursor-pointer hover:text-custom-orange dark:hover:text-custom-orange transition-colors"
          aria-label="Toggle view mode"
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
    </div>
    <div class="ml-auto">
      <HeaderSearchInput v-if="isSearchVisible" />
    </div>
  </nav>
</template>
