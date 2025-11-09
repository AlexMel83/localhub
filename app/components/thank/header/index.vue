<template>
  <nav
    :class="[
      'w-full flex flex-col h-[60px] px-3 pt-2 fixed top-0 z-[1500]',
      isThankFulPage && appStore.isListView ? 'bg-transparent' : 'relative',
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
      <h1
        :class="
          isThankFulPage && appStore.isListView ? 'font-bold drop-shadow-2xl tracking-wide text-black' : 'font-semibold'
        "
        style="text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6)"
      >
        Вдячна Хмельниччина
      </h1>
      <div class="flex items-center gap-4">
        <!-- Кнопка перемикання вигляду з тултіпом -->
        <UTooltip
          v-if="isThankFulPage"
          :text="$t('Header.toggleViewMode')"
          :popper="{ placement: 'bottom', arrow: true }"
        >
          <UButton
            :class="buttonClasses"
            color="neutral"
            size="sm"
            variant="soft"
            :aria-label="$t('Header.toggleViewMode')"
            @click="appStore.toggleListView"
          >
            <span :class="textClasses">{{ !appStore.isListView ? $t('Header.viewMap') : $t('Header.viewList') }}</span>
            <Icon
              :name="`${!appStore.isListView ? 'lucide:map' : 'lucide:list'}`"
              class="w-5 h-5 transition-transform duration-300 ease-in-out"
              :class="iconClasses"
            />
          </UButton>
        </UTooltip>
        <ThankHeaderButtons @toggle-search="toggleSearch" />
      </div>
    </div>
    <div class="ml-auto">
      <HeaderSearchInput v-if="isSearchVisible" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '~/stores/app.store';
import { useRoute } from 'vue-router';

const appStore = useAppStore();
const route = useRoute();
const isSearchVisible = ref(false);

const isThankFulPage = computed(() => {
  return route.path === '/thankful' || /^\/[a-z]{2}(\/thankful)?$/.test(route.path);
});

const buttonClasses = computed(() => {
  const baseClasses = ['ml-2 cursor-pointer transition-all duration-200 ease-in-out', 'active:scale-95'];

  if (isThankFulPage.value && appStore.isListView) {
    return [...baseClasses, 'hover:bg-white/80 hover:dark:bg-gray-800/80'];
  }

  return [...baseClasses, 'hover:bg-gray-100 dark:hover:bg-gray-800'];
});

const iconClasses = computed(() => {
  return [appStore.isDark ? 'text-white' : 'text-gray-900'];
});

const textClasses = computed(() => {
  return [appStore.isDark ? 'text-white' : 'text-gray-900'];
});

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};
</script>

<style scoped>
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
