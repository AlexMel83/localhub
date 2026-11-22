<template>
  <main class="mx-auto w-full max-w-4xl space-y-6 px-4 py-6">
    <header class="space-y-1">
      <h1 class="text-2xl font-bold sm:text-3xl">{{ t('Svitlo.regionTitle', { region: name }) }}</h1>
      <p class="text-muted">{{ t('Svitlo.regionDescription', { region: name }) }}</p>
    </header>

    <UCard v-if="savedHere" :ui="{ body: 'p-4 sm:p-4' }" class="ring-primary/40">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="font-semibold">{{ t('Svitlo.picker.yourQueue', { queue: savedHere }) }}</p>
        <UButton
          :to="localePath(`/svitlo-cherga/${region}/${queueToParam(savedHere)}`)"
          size="lg"
          class="min-h-11"
          trailing-icon="i-lucide-arrow-right"
        >
          {{ t('Svitlo.picker.open') }}
        </UButton>
      </div>
    </UCard>

    <UCard>
      <SvitloQueuePicker :regions="regions" :region="region" :current="savedHere" />
    </UCard>

    <UCard v-if="region === 'khmelnytska-oblast'">
      <SvitloAddressSearch :region="region" :default-settlement="locale === 'en' ? '' : 'Старокостянтинів'" />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-semibold">{{ t('Svitlo.matrix.title') }}</h2>
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

    <ShareButtons :url="canonical" :page-object="{ title: pageTitle }" />
  </main>
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
  ogImage: `${siteUrl}/svitlo-cherga.jpg`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});
useHead({
  link: [{ rel: 'canonical', href: canonical }],
  meta: [{ name: 'theme-color', content: '#0057b7' }],
});
</script>
