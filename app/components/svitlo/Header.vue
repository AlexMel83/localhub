<template>
  <header class="svitlo-header sticky top-0 z-40 border-b border-[var(--svitlo-line)]">
    <div class="mx-auto flex h-16 w-full max-w-[1320px] items-center justify-between gap-3 px-4 sm:h-18 sm:px-10">
      <NuxtLink
        :to="localePath('/svitlo-cherga')"
        class="flex min-h-11 items-center gap-3"
        :aria-label="`${t('Svitlo.brand.first')} ${t('Svitlo.brand.second')} – ${t('Svitlo.brand.tagline')}`"
      >
        <SvitloLogo class="size-10 shrink-0 sm:size-11" />
        <span class="flex flex-col">
          <span class="svitlo-display text-[1.35rem] leading-[0.95]"
            >{{ t('Svitlo.brand.first') }}
            <span class="text-[var(--svitlo-accent-ink)]">{{ t('Svitlo.brand.second') }}</span></span
          >
          <span class="hidden text-xs text-[var(--svitlo-muted)] sm:block">{{ t('Svitlo.brand.tagline') }}</span>
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-1" :aria-label="t('Svitlo.brand.nav')">
        <NuxtLink
          :to="localePath('/svitlo-cherga')"
          class="hidden min-h-11 items-center px-3 text-[13px] font-bold tracking-wide uppercase hover:text-[var(--svitlo-accent-ink)] md:inline-flex"
        >
          {{ t('Svitlo.footer.allQueues') }}
        </NuxtLink>
        <a
          v-if="botUrl"
          :href="botUrl"
          target="_blank"
          rel="noopener"
          class="hidden min-h-11 items-center gap-2 px-3 text-[13px] font-bold tracking-wide uppercase hover:text-[var(--svitlo-accent-ink)] md:inline-flex"
        >
          <UIcon name="i-lucide-send" class="size-4" aria-hidden="true" />{{ t('Svitlo.footer.bot') }}
        </a>
        <NuxtLink
          :to="switchLocalePath(otherLocale)"
          class="inline-flex size-11 items-center justify-center text-[13px] font-bold text-[var(--svitlo-muted)] hover:text-[var(--svitlo-ink)]"
          :lang="otherLocale"
        >
          {{ otherLocale === 'en' ? 'ENG' : 'УКР' }}
        </NuxtLink>
        <button
          type="button"
          class="inline-flex size-11 items-center justify-center hover:text-[var(--svitlo-accent-ink)]"
          :aria-label="t('Header.toggleTheme')"
          @click="toggleTheme"
        >
          <UIcon :name="isDark ? 'i-lucide-sun' : 'i-lucide-moon'" class="size-5" aria-hidden="true" />
        </button>
        <NuxtLink
          :to="localePath('/')"
          class="inline-flex size-11 items-center justify-center hover:text-[var(--svitlo-accent-ink)]"
          :aria-label="t('Svitlo.brand.home')"
          :title="t('Svitlo.brand.home')"
        >
          <UIcon name="i-lucide-house" class="size-5" aria-hidden="true" />
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { t, locale } = useI18n();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const appStore = useAppStore();
const botUrl = useSvitloBotUrl();

const otherLocale = computed(() => (locale.value === 'en' ? 'uk' : 'en'));

// Nuxt UI's color mode owns the `dark` class; keep the site-wide store (cookie) in step.
const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');
function toggleTheme() {
  const next = !isDark.value;
  colorMode.preference = next ? 'dark' : 'light';
  if (appStore.isDark !== next) appStore.toggleDarkMode();
}
</script>
