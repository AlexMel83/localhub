<template>
  <footer class="border-t border-[var(--svitlo-line)] bg-[var(--svitlo-surface)]">
    <div class="mx-auto grid w-full max-w-[1320px] gap-10 px-4 py-10 sm:px-10 md:grid-cols-[2fr_1fr_1fr]">
      <div class="flex max-w-md flex-col gap-4">
        <NuxtLink :to="localePath('/svitlo-cherga')" class="flex items-center gap-3 self-start">
          <SvitloLogo class="size-12 shrink-0" />
          <span class="svitlo-display text-2xl"
            >{{ t('Svitlo.brand.first') }}
            <span class="text-[var(--svitlo-accent-ink)]">{{ t('Svitlo.brand.second') }}</span></span
          >
        </NuxtLink>
        <p class="text-sm text-[var(--svitlo-muted)]">{{ t('Svitlo.footer.about') }}</p>
        <a
          v-if="botUrl"
          :href="botUrl"
          target="_blank"
          rel="noopener"
          class="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-sm bg-[var(--svitlo-accent)] px-5 text-[13px] font-bold tracking-wide text-black uppercase"
        >
          <UIcon name="i-lucide-send" class="size-4" aria-hidden="true" />{{ t('Svitlo.footer.bot') }}
        </a>
      </div>

      <nav :aria-label="t('Svitlo.footer.schedule')">
        <h2 class="svitlo-eyebrow mb-3">{{ t('Svitlo.footer.schedule') }}</h2>
        <ul class="flex flex-col text-sm">
          <li>
            <NuxtLink :to="localePath('/svitlo-cherga')" class="inline-flex min-h-11 items-center hover:underline">{{
              t('Svitlo.footer.allQueues')
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink
              :to="localePath('/svitlo-cherga') + '#address'"
              class="inline-flex min-h-11 items-center hover:underline"
              >{{ t('Svitlo.footer.findAddress') }}</NuxtLink
            >
          </li>
          <li>
            <a
              href="https://hoe.com.ua/page/pogodinni-vidkljuchennja"
              target="_blank"
              rel="noopener"
              class="inline-flex min-h-11 items-center gap-1 hover:underline"
              >{{ t('Svitlo.source.official') }}<UIcon name="i-lucide-arrow-up-right" class="size-4" aria-hidden="true"
            /></a>
          </li>
        </ul>
      </nav>

      <nav aria-label="LocalHub">
        <h2 class="svitlo-eyebrow mb-3">LocalHub</h2>
        <ul class="flex flex-col text-sm">
          <li>
            <NuxtLink :to="localePath('/')" class="inline-flex min-h-11 items-center hover:underline">{{
              t('Footer.home')
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/info-source')" class="inline-flex min-h-11 items-center hover:underline">{{
              t('Footer.sourceInfo')
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/donation-terms')" class="inline-flex min-h-11 items-center hover:underline">{{
              t('Footer.terms')
            }}</NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/privacy-policy')" class="inline-flex min-h-11 items-center hover:underline">{{
              t('Footer.policy')
            }}</NuxtLink>
          </li>
        </ul>
      </nav>
    </div>
    <div class="border-t border-[var(--svitlo-line)]">
      <div
        class="mx-auto flex w-full max-w-[1320px] flex-wrap justify-between gap-2 px-4 py-5 text-[13px] text-[var(--svitlo-muted)] sm:px-10"
      >
        <span>{{ t('Svitlo.footer.partOf') }}</span>
        <a href="https://it.starkon.pp.ua" target="_blank" rel="noopener" class="hover:underline"
          >{{ t('Footer.developer') }} {{ t('Footer.copyright') }}</a
        >
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const botUrl = useSvitloBotUrl();
</script>
