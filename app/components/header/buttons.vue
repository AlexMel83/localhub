<template>
  <div class="flex items-center space-x-3">
    <!-- Переключатель языка -->
    <UButton
      class="cursor-pointer hover:text-custom-orange dark:hover:text-custom-orange transition-colors relative w-12 h-8 flex items-center justify-center overflow-hidden"
      @click="toggleLanguage"
      color="neutral"
    >
      <transition name="fade" mode="out-in">
        <span :key="currentLocale" class="absolute">
          {{ currentLocale.toUpperCase() === 'UK' ? 'ENG' : 'UKR' }}
        </span>
      </transition>
    </UButton>
    <!-- Переключатель цветовой темы -->
    <UButton
      class="cursor-pointer hover:text-custom-orange dark:hover:text-custom-orange transition-colors"
      aria-label="Toggle dark mode"
      @click="appStore.toggleDarkMode"
      color="neutral"
    >
      <Icon
        :name="`${appStore.isDark ? 'line-md:sunny-filled-loop' : 'line-md:sunny-filled-loop-to-moon-filled-loop-transition'}`"
        class="w-5 h-5 transition-transform duration-300 ease-in-out"
      />
    </UButton>
    <!-- Кнопка поиска -->
    <UButton class="cursor-pointer" aria-label="Search" @click="toggleSearch" color="neutral">
      <Icon name="lucide-search" class="w-5 h-5" />
    </UButton>
    <!-- Кнопка мобильного меню -->
    <UButton
      class="cursor-pointer md:hidden transition-colors"
      :class="{
        'text-custom-orange': isMenuOpen,
        'hover:text-custom-orange dark:hover:text-custom-orange': !isMenuOpen,
      }"
      @click="toggleMenu"
      color="neutral"
    >
      <Icon
        :name="`${isMenuOpen ? 'material-symbols:close-rounded' : 'humbleicons:bars'}`"
        :class="['w-7 h-7 transition-transform duration-300 ease-in-out', { 'rotate-90': isMenuOpen }]"
      />
    </UButton>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { UButton } from '#components';

const props = defineProps({
  isMenuOpen: {
    type: Boolean,
    default: false,
  },
  isSearchVisible: Boolean,
});

const emit = defineEmits(['toggleMenu', 'toggle-search']);

const appStore = useAppStore();
const { locale } = useI18n();
const currentLocale = computed(() => locale.value);
const router = useRouter();
const localSearchVisible = ref(props.isSearchVisible);

watch(
  () => props.isSearchVisible,
  (val) => {
    localSearchVisible.value = val;
  },
);

onMounted(() => {
  if (process.client) {
    document.documentElement.classList.toggle('dark', appStore.isDark);
  }
});

const toggleLanguage = async () => {
  const newLang = currentLocale.value === 'uk' ? 'en' : 'uk';
  try {
    const currentRoute = router.currentRoute.value;
    const newPath =
      newLang === 'uk'
        ? currentRoute.fullPath.replace(/^\/(en|uk)/, '')
        : `/${newLang}${currentRoute.fullPath.replace(/^\/(en|uk)/, '')}`;
    locale.value = newLang;
    await router.push(newPath);
  } catch (error) {
    console.error('Failed to change language:', error);
  }
};

const toggleSearch = () => {
  localSearchVisible.value = !localSearchVisible.value;
  emit('toggle-search', localSearchVisible.value);
};
const toggleMenu = () => emit('toggleMenu');
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20%);
}
</style>
