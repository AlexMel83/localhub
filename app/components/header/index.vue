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
          <NuxtImg
            src="Localhub-logo-320.jpg"
            alt="LocalHub"
            title="LocalHub"
            class="h-full mr-auto max-h-[40px] sm:max-h-[60px] object-contain"
          />
        </NuxtLink>
      </div>
      <div class="flex items-center gap-4">
        <!-- Кнопка перемикання вигляду з тултіпом -->
        <UTooltip v-if="isHomePage" :text="$t('Header.toggleViewMode')" :popper="{ placement: 'bottom', arrow: true }">
          <UButton
            :class="buttonClasses"
            color="neutral"
            size="sm"
            variant="soft"
            :aria-label="$t('Header.toggleViewMode')"
            @click="appStore.toggleListView"
          >
            <span :class="textClasses">{{ appStore.isListView ? $t('Header.viewMap') : $t('Header.viewList') }}</span>
            <Icon
              :name="`${appStore.isListView ? 'lucide:map' : 'lucide:list'}`"
              class="w-5 h-5 transition-transform duration-300 ease-in-out"
              :class="iconClasses"
            />
          </UButton>
        </UTooltip>
        <HeaderButtons @toggle-search="toggleSearch" />
      </div>
    </div>
    <div class="ml-auto">
      <HeaderSearchInput v-if="isSearchVisible" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '../../stores/app.store';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
const route = useRoute();
const isSearchVisible = ref(false);

// Перевіряємо, чи поточна сторінка є головною
const isHomePage = computed(() => {
  return route.path === '/' || /^\/[a-z]{2}\/?$/.test(route.path);
});

// Класи для кнопки
const buttonClasses = computed(() => {
  const baseClasses = ['ml-2 cursor-pointer transition-all duration-200 ease-in-out', 'active:scale-95'];

  // На головній сторінці з мапою використовуємо світлий hover
  if (isHomePage.value && !appStore.isListView) {
    return [...baseClasses, 'hover:bg-white/80 hover:dark:bg-gray-800/80'];
  }

  // В інших випадках використовуємо стандартний hover
  return [...baseClasses, 'hover:bg-gray-100 dark:hover:bg-gray-800'];
});

// Класи для іконки
const iconClasses = computed(() => {
  // if (isHomePage.value && !appStore.isListView) {
  //   return ['text-gray-900'];
  // }
  return [appStore.isDark ? 'text-white' : 'text-gray-900'];
});

// Класи для тексту
const textClasses = computed(() => {
  // if (isHomePage.value && !appStore.isListView) {
  //   return ['text-gray-900'];
  // }
  return [appStore.isDark ? 'text-white' : 'text-gray-900'];
});

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};
</script>

<style scoped>
/* Стилі для плавної анімації */
button:hover .scale-110 {
  transform: scale(1.1);
}

button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .gap-4 {
    gap: 1rem;
  }
}
</style>
