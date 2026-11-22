<template>
  <div class="svitlo-page">
    <main class="mx-auto w-full max-w-[1320px] space-y-6 px-4 py-6 sm:px-10 sm:py-10">
      <header class="flex flex-col gap-3">
        <span v-if="today" class="svitlo-eyebrow">{{ dayLabel(today.date) }}</span>
        <h1 class="svitlo-display text-[2.75rem] sm:text-7xl">
          {{ t('Svitlo.title') }}
          <span class="block text-[var(--svitlo-accent-ink)]">{{ name }}</span>
        </h1>
        <p class="max-w-2xl text-[var(--svitlo-muted)]">{{ t('Svitlo.regionDescription', { region: name }) }}</p>
      </header>

      <NuxtLink
        v-if="savedHere"
        :to="localePath(`/svitlo-cherga/${region}/${queueToParam(savedHere)}`)"
        class="svitlo-cut flex items-center gap-4 bg-[var(--svitlo-accent)] p-4 text-black sm:max-w-xl"
      >
        <UIcon name="i-lucide-bookmark-check" class="size-8 shrink-0" aria-hidden="true" />
        <span class="flex flex-1 flex-col">
          <span class="text-[13px] font-bold">{{ t('Svitlo.picker.yourQueue', { queue: savedHere }) }}</span>
          <span class="svitlo-display text-2xl leading-tight">{{ t('Svitlo.picker.open') }}</span>
        </span>
        <UIcon name="i-lucide-arrow-up-right" class="size-6 shrink-0" aria-hidden="true" />
      </NuxtLink>

      <UCard class="rounded-none">
        <SvitloQueuePicker :regions="regions" :region="region" :current="savedHere" />
      </UCard>

      <UCard v-if="info.addressSearch" id="address" class="scroll-mt-24 rounded-none">
        <SvitloAddressSearch
          :region="region"
          :default-settlement="locale === 'en' ? '' : (info.addressSearch.defaultSettlement ?? '')"
          :official-url="info.addressSearch.officialUrl"
        />
      </UCard>

      <UCard class="rounded-none">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="svitlo-display text-2xl sm:text-3xl">{{ t('Svitlo.matrix.title') }}</h2>
            <div class="flex gap-1" role="tablist">
              <UButton
                v-for="d in days"
                :key="d.key"
                role="tab"
                :aria-selected="activeDay === d.key"
                :color="activeDay === d.key ? 'primary' : 'neutral'"
                :variant="activeDay === d.key ? 'solid' : 'ghost'"
                class="min-h-11"
                @click="setDay(d.key)"
              >
                {{ d.label }}
              </UButton>
            </div>
          </div>
        </template>
        <div v-if="pending && !current" class="space-y-2">
          <USkeleton v-for="i in 6" :key="i" class="h-6 w-full" />
        </div>
        <template v-else-if="current">
          <p class="mb-3 text-sm text-muted">{{ dayLabel(current.date) }}</p>
          <SvitloStateAlerts
            class="mb-3"
            :state="current.publishedState === 'published' ? null : current.publishedState"
            :emergency="current.emergency"
            :stale="current.stale"
            :sources-agree="current.sourcesAgree"
          />
          <SvitloQueueMatrix
            v-if="current.queues.length && current.publishedState !== 'not_published'"
            :region="region"
            :date="current.date"
            :queues="current.queues"
            :now="activeDay === 'today' ? now : null"
            :highlight="savedHere"
            :tomorrow="activeDay === 'tomorrow'"
          />
        </template>
        <SvitloStateAlerts v-else error />
      </UCard>

      <SvitloChangesFeed v-if="changes?.length" :changes="changes" />

      <SvitloSourceFooter
        v-if="today"
        :source="today.source"
        :official-url="info?.official ? info.source.url : null"
        :region="region"
        :updated-at="today.sourceUpdatedAt"
        :checked-at="today.lastCheckedAt ?? today.fetchedAt"
      />

      <SvitloShare :url="canonical" :title="pageTitle" />
    </main>
  </div>
</template>

<script setup lang="ts">
import type { RegionDay, RegionInfo, ScheduleChange } from '#shared/types/svitlo';
import { DEFAULT_REGION, findRegion, publicRegion, SVITLO_REGIONS } from '#shared/utils/svitloRegions';
import { queueToParam } from '#shared/utils/svitloTime';

const props = defineProps<{ region: string }>();

const { t, locale, dayLabel, regionName } = useSvitloFormat();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const now = useSvitloNow();
const { saved } = useSvitloSavedQueue();

const def = findRegion(props.region);
if (!def) throw createError({ statusCode: 404, statusMessage: 'Region not found', fatal: true });
const info = publicRegion(def);
const regions: RegionInfo[] = SVITLO_REGIONS.map(publicRegion);
const name = computed(() => regionName(info));

const [{ data: today, pending }, { data: tomorrow }, { data: changes }] = await Promise.all([
  useFetch<RegionDay>(`/api/svitlo/${props.region}/schedule`, {
    query: { date: 'today' },
    key: `svitlo-r-${props.region}-today`,
  }),
  useFetch<RegionDay>(`/api/svitlo/${props.region}/schedule`, {
    query: { date: 'tomorrow' },
    key: `svitlo-r-${props.region}-tomorrow`,
  }),
  useFetch<ScheduleChange[]>(`/api/svitlo/${props.region}/changes`, {
    key: `svitlo-c-${props.region}`,
    lazy: true,
    server: false,
  }),
]);

const activeDay = ref<'today' | 'tomorrow'>('today');
function setDay(day: 'today' | 'tomorrow') {
  activeDay.value = day;
}
const current = computed(() => (activeDay.value === 'today' ? today.value : tomorrow.value));
const days = computed(() => [
  { key: 'today' as const, label: t('Svitlo.today') },
  { key: 'tomorrow' as const, label: t('Svitlo.tomorrow') },
]);

const savedHere = computed(() => (saved.value?.region === props.region ? saved.value.queue : null));

const siteUrl = String(config.public.siteUrl || 'https://json63.pp.ua').replace(/\/$/, '');
// The default region lives at /svitlo-cherga; its /svitlo-cherga/<slug> twin points there.
const canonical = computed(
  () =>
    `${siteUrl}${localePath(props.region === DEFAULT_REGION ? '/svitlo-cherga' : `/svitlo-cherga/${props.region}`)}`,
);
const pageTitle = computed(() => t('Svitlo.regionTitle', { region: name.value }));

useSeoMeta({
  title: pageTitle,
  description: () => t('Svitlo.regionDescription', { region: name.value }),
  ogTitle: pageTitle,
  ogDescription: () => t('Svitlo.regionDescription', { region: name.value }),
  ogUrl: canonical,
  ogSiteName: () => t('Svitlo.ogSiteName'),
  ogLocale: () => (locale.value === 'en' ? 'en_US' : 'uk_UA'),
  ogImage: `${siteUrl}/svitlo/og/default.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: pageTitle,
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterImage: `${siteUrl}/svitlo/og/default.jpg`,
});
useHead({
  link: [{ rel: 'canonical', href: canonical }],
  meta: [{ name: 'theme-color', content: '#111a0b' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: pageTitle.value,
              description: t('Svitlo.regionDescription', { region: name.value }),
              url: canonical.value,
              inLanguage: locale.value === 'en' ? 'en' : 'uk',
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: t('Svitlo.title'),
                  item: `${siteUrl}${localePath('/svitlo-cherga')}`,
                },
                { '@type': 'ListItem', position: 2, name: name.value, item: canonical.value },
              ],
            },
            {
              '@type': 'ItemList',
              name: pageTitle.value,
              itemListElement: info.queues.map((q, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                name: t('Svitlo.queue', { queue: q }),
                url: `${siteUrl}${localePath(`/svitlo-cherga/${props.region}/${queueToParam(q)}`)}`,
              })),
            },
          ],
        }),
      ),
    },
  ],
});
</script>
