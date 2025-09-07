<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAppStore } from '../../stores/app.store';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const appStore = useAppStore();
const route = useRoute();
const { t } = useI18n();

// Стан розгортання меню
const isMenuOpen = ref(false);
const showAbout = ref(false);

// Визначаємо, чи є поточна сторінка "головною"
const isHomePage = computed(() => {
  const path = route.path;
  if (path === '/') return true;
  return /^\/[a-z]{2}$/.test(path);
});

// Логіка показу fixed футера тільки на мапі
const showFixedFooter = computed(() => {
  return isHomePage.value && !appStore.isListView;
});

// Закриття меню при кліку поза межами
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Закриття меню при переході по лінку
const closeMenu = () => {
  isMenuOpen.value = false;
};

const toggleAbout = () => {
  showAbout.value = !showAbout.value;
};
</script>

<template>
  <!-- Фіксований футер тільки на головній сторінці в режимі мапи -->
  <footer v-if="showFixedFooter" class="fixed bottom-0 left-0 w-full z-50 pointer-events-auto">
    <!-- Компактний випадаючий блок з правого боку -->
    <div
      v-show="isMenuOpen"
      class="absolute bottom-full right-4 mb-2 text-black bg-black/20 rounded-xs shadow-lg transition-all duration-300 ease-out min-w-38"
    >
      <div class="p-2">
        <!-- Компактний список лінків -->
        <div class="space-y-1">
          <!-- Про платформу -->
          <button
            class="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors group w-full text-left"
            @click="toggleAbout"
          >
            <svg
              class="w-4 h-4 text-purple-600 group-hover:text-purple-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M12 18.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"
              />
            </svg>
            <span class="text-sm">{{ t('Footer.about') }}</span>
          </button>

          <!-- Акордеон блок -->
          <transition name="slide-fade">
            <div v-show="showAbout" class="p-2 text-xs leading-relaxed rounded-sm">
              <h1 class="font-semibold mb-1">{{ t('Footer.akordeonTitle') }}</h1>
              <p class="mb-1">
                {{ t('Footer.akordeonText1') }}
              </p>
              <p class="mb-1">
                {{ t('Footer.akordeonText2') }}
              </p>
              <p>
                {{ t('Footer.akordeonText3') }}
              </p>
            </div>
          </transition>

          <NuxtLink
            to="/donation-terms"
            class="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors group"
            @click="closeMenu"
          >
            <svg
              class="w-4 h-4 text-blue-600 group-hover:text-blue-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span class="text-sm">{{ t('Footer.terms') }}</span>
          </NuxtLink>

          <NuxtLink
            to="/privacy-policy"
            class="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors group"
            @click="closeMenu"
          >
            <svg
              class="w-4 h-4 text-green-600 group-hover:text-green-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span class="text-sm">{{ t('Footer.policy') }}</span>
          </NuxtLink>

          <NuxtLink
            to="/howtohelp"
            class="flex items-center gap-1 p-1 rounded hover:bg-white/10 transition-colors group"
            @click="closeMenu"
          >
            <svg
              class="w-4 h-4 text-yellow-600 group-hover:text-yellow-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span class="text-sm">{{ t('Footer.howToHelp') }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Основний бар футера БЕЗ фону -->
    <div class="px-4 py-2 flex items-center justify-between">
      <!-- Лого розробника -->
      <div class="text-xs">
        <NuxtLink
          class="text-black hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
          to="https://it.starkon.pp.ua"
          target="_blank"
        >
          {{ t('Footer.developer') }} {{ t('Footer.copyright') }}
        </NuxtLink>
      </div>

      <!-- Кнопка меню (додаткова опція) -->
      <button
        class="text-black hover:text-blue-600 transition-colors flex items-center gap-1 text-xs"
        :class="{ 'text-blue-600': isMenuOpen }"
        @click="toggleMenu"
      >
        <svg
          class="w-5 h-5 transition-transform duration-200"
          :class="{ '-rotate-180': isMenuOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        {{ t('Footer.info') }}
      </button>
    </div>
  </footer>

  <!-- Звичайний повний футер для інших випадків -->
  <footer v-else class="border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-2 sm:px-3 lg:px-6 py-2">
      <!-- Основний контент футера -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
        <!-- Блок про платформу -->
        <div class="md:col-span-2">
          <div class="flex justify-start items-center gap-2 mb-4">
            <NuxtImg
              src="/Localhub-logo-320.jpg"
              alt="LocalHub"
              title="LocalHub"
              class="h-full max-h-[40px] sm:max-h-[60px] object-contain"
            />
            <h2 class="text-lg font-semibold">{{ t('Footer.title') }}</h2>
          </div>
          <p class="text-sm mb-4 leading-relaxed">
            {{ t('Footer.description') }}
          </p>
          <div class="flex items-center gap-1 text-sm">
            <span class="text-blue-500">💙</span>
            <span>{{ t('Footer.slogan') }}</span>
            <span class="text-yellow-500">💛</span>
          </div>
        </div>

        <!-- Навігація -->
        <div>
          <h3 class="text-sm font-semibold mb-4">
            {{ t('Footer.navigation') }}
          </h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.home') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/businesses" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.businesses') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/services" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.services') }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Info -->
        <div>
          <h3 class="text-sm font-semibold mb-4">
            {{ t('Footer.info') }}
          </h3>
          <ul class="space-y-3">
            <li>
              <NuxtLink to="/info-source" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.sourceInfo') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/how-to-add-info" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.howToAddInfo') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/howtohelp" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.howToHelp') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/donation-terms" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.terms') }}
              </NuxtLink>
            </li>
            <li>
              <NuxtLink to="/privacy-policy" class="text-sm hover:text-blue-600 transition-colors">
                {{ t('Footer.policy') }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Нижня частина -->
      <div class="mt-8 pt-6 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <!-- Копірайт -->
          <div class="text-sm">
            <NuxtLink
              class="hover:text-blue-600 transition-colors font-medium"
              to="https://it.starkon.pp.ua"
              target="_blank"
            >
              {{ t('Footer.developer') }} {{ t('Footer.copyright') }}
            </NuxtLink>
          </div>

          <!-- Соцмережі та контакти -->
          <div class="flex items-center gap-4">
            <span class="text-sm">
              {{ t('Footer.followUs', 'Слідкуйте за нами:') }}
            </span>
            <div class="flex gap-3">
              <!-- Telegram -->
              <a href="#" class="hover:text-blue-500 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
                  />
                </svg>
              </a>
              <!-- Facebook -->
              <a href="#" class="hover:text-blue-600 transition-colors">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-fade-enter-to,
.slide-fade-leave-from {
  max-height: 500px;
  opacity: 1;
}
/* Додаткові анімації для плавності */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Покращена тінь для розгортаючого меню */
.shadow-lg {
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Градієнт для роздільника */
.h-px {
  height: 1px;
}
</style>
