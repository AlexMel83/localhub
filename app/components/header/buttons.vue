<template>
  <div class="flex items-center gap-2 sm:gap-3">
    <!-- Переключувач мови з тултіпом -->
    <UTooltip :text="$t('Header.toggleLanguage')" :popper="{ placement: 'bottom' }">
      <UButton
        ref="langButton"
        :class="buttonClasses"
        color="neutral"
        size="sm"
        variant="ghost"
        :aria-label="$t('Header.toggleLanguage')"
        @click="toggleLanguage"
      >
        <div class="relative w-8 h-6 flex items-center justify-center overflow-hidden">
          <Transition name="lang-fade" mode="out-in">
            <span :key="currentLocale" class="absolute text-xs font-semibold select-none" :class="textClasses">
              {{ languageLabel }}
            </span>
          </Transition>
        </div>
      </UButton>
    </UTooltip>

    <!-- Переключувач теми з тултіпом -->
    <UTooltip :text="$t('Header.toggleTheme')" :popper="{ placement: 'bottom' }">
      <UButton
        ref="themeButton"
        :class="buttonClasses"
        color="neutral"
        size="sm"
        variant="ghost"
        :aria-label="$t('Header.toggleTheme')"
        @click="toggleTheme"
      >
        <Transition name="theme-fade" mode="out-in">
          <Icon
            :key="appStore.isDark"
            :name="themeIconName"
            class="w-5 h-5 transition-transform duration-300 ease-in-out"
            :class="iconClasses"
          />
        </Transition>
      </UButton>
    </UTooltip>

    <!-- Кнопка пошуку з тултіпом -->
    <UTooltip :text="$t('Header.toggleSearch')" :popper="{ placement: 'bottom' }">
      <UButton
        ref="searchButton"
        :class="[buttonClasses, { 'text-primary-500': isSearchActive }]"
        color="neutral"
        size="sm"
        variant="ghost"
        :aria-label="$t('Header.toggleSearch')"
        :aria-pressed="isSearchActive"
        @click="toggleSearch"
      >
        <Icon name="lucide:search" class="w-5 h-5" :class="[iconClasses, { 'scale-110': isSearchActive }]" />
      </UButton>
    </UTooltip>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useAppStore } from '../../stores/app.store';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
// @ts-expect-error types needed
import { useNuxtApp } from '#app';

interface Props {
  isMenuOpen?: boolean;
  isSearchVisible?: boolean;
  showMobileMenu?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isMenuOpen: false,
  isSearchVisible: false,
  showMobileMenu: true,
});

interface Emits {
  (e: 'toggleMenu'): void;
  (e: 'toggle-search', value: boolean): void;
  (e: 'language-changed', locale: string): void;
}

const emit = defineEmits<Emits>();

const appStore = useAppStore();
const { locale } = useI18n();
const router = useRouter();
const route = useRoute();
const { $gtag } = useNuxtApp();

const langButton = ref<HTMLElement>();
const themeButton = ref<HTMLElement>();
const searchButton = ref<HTMLElement>();

const currentLocale = computed(() => locale.value);

const languageLabel = computed(() => {
  return currentLocale.value.toUpperCase() === 'UK' ? 'ENG' : 'УКР';
});

const themeIconName = computed(() => {
  return appStore.isDark ? 'lucide:sun' : 'lucide:moon';
});

const isHomePage = computed(() => {
  return route.path === '/' || /^\/[a-z]{2}\/?$/.test(route.path);
});

const buttonClasses = computed(() => {
  const baseClasses = ['cursor-pointer transition-all duration-200 ease-in-out', 'active:scale-95'];

  // Якщо це головна сторінка з мапою, фіксуємо світлий hover фон
  if (isHomePage.value && !appStore.isListView) {
    return [...baseClasses, 'hover:bg-white/80'];
  }

  // В інших випадках використовуємо оригінальний hover
  return [...baseClasses, 'hover:bg-gray-100 dark:hover:bg-gray-800'];
});

const iconClasses = computed(() => {
  if (isHomePage.value && !appStore.isListView) {
    return ['text-gray-900'];
  }
  return [appStore.isDark ? 'text-white' : 'text-gray-900'];
});

const textClasses = computed(() => {
  if (isHomePage.value && !appStore.isListView) {
    return ['text-gray-900'];
  }
  return [appStore.isDark ? 'text-white' : 'text-gray-900'];
});

const isSearchActive = computed(() => props.isSearchVisible);

const isLanguageChanging = ref(false);

const toggleLanguage = async (): Promise<void> => {
  if (isLanguageChanging.value) return;

  isLanguageChanging.value = true;
  const newLang = currentLocale.value === 'uk' ? 'en' : 'uk';

  try {
    const currentRoute = router.currentRoute.value;
    const currentPath = currentRoute.fullPath;

    let newPath: string;
    if (newLang === 'uk') {
      newPath = currentPath.replace(/^\/en/, '') || '/';
    } else {
      const cleanPath = currentPath.replace(/^\/uk/, '');
      newPath = `/en${cleanPath === '/' ? '' : cleanPath}`;
    }

    locale.value = newLang;
    await router.push(newPath);
    emit('language-changed', newLang);

    if ($gtag) {
      $gtag('event', 'language_change', {
        new_language: newLang,
        previous_language: currentLocale.value,
      });
    }
  } catch (error) {
    console.error('Помилка при зміні мови:', error);
  } finally {
    isLanguageChanging.value = false;
  }
};

const toggleTheme = (): void => {
  try {
    appStore.toggleDarkMode();

    if ($gtag) {
      $gtag('event', 'theme_change', {
        theme: appStore.isDark ? 'dark' : 'light',
      });
    }
  } catch (error) {
    console.error('Помилка при зміні теми:', error);
  }
};

const toggleSearch = (): void => {
  const newSearchState = !props.isSearchVisible;
  emit('toggle-search', newSearchState);

  if (newSearchState) {
    nextTick(() => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
      searchInput?.focus();
    });
  }
};

const handleKeyboardShortcuts = (event: KeyboardEvent): void => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault();
    toggleSearch();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'L') {
    event.preventDefault();
    toggleLanguage();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'D') {
    event.preventDefault();
    toggleTheme();
    return;
  }
};

onMounted(() => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', appStore.isDark);
    document.addEventListener('keydown', handleKeyboardShortcuts);
  }
});

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', handleKeyboardShortcuts);
  }
});

watch(
  () => appStore.isDark,
  (isDark) => {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark);
    }
  },
);
</script>

<style scoped>
.lang-fade-enter-active,
.lang-fade-leave-active {
  transition: all 0.25s ease-in-out;
}

.lang-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.lang-fade-leave-to {
  opacity: 0;
  transform: translateY(8px) scale(0.95);
}

.theme-fade-enter-active,
.theme-fade-leave-active {
  transition: all 0.3s ease-in-out;
}

.theme-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.theme-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

button:hover .scale-110 {
  transform: scale(1.1);
}

button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .gap-2 {
    gap: 0.375rem;
  }
}
</style>
