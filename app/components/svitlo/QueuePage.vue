<template>
  <main class="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
    <nav class="text-sm">
      <NuxtLink
        :to="localePath(regionPath)"
        class="inline-flex min-h-11 items-center gap-1 text-primary hover:underline"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4" aria-hidden="true" />{{ t('Svitlo.backToRegion') }}
      </NuxtLink>
    </nav>

    <SvitloStateAlerts v-if="error || !data" error />
    <template v-else>
      <SvitloStatusHero
        :queue="data.queue"
        :region-name="name"
        :today="data.today"
        :tomorrow="data.tomorrow"
        :now="now"
      >
        <div class="mt-4 flex flex-wrap gap-2">
          <UButton
            v-if="!isSaved"
            color="neutral"
            variant="solid"
            class="min-h-11 bg-white/90 text-slate-900 hover:bg-white"
            icon="i-lucide-bookmark"
            @click="saveQueue"
          >
            {{ t('Svitlo.picker.save') }}
          </UButton>
          <UBadge
            v-else
            color="neutral"
            variant="solid"
            size="lg"
            class="min-h-11 bg-white/90 text-slate-900"
            icon="i-lucide-bookmark-check"
          >
            {{ t('Svitlo.picker.yourQueue', { queue: data.queue }) }}
          </UBadge>
          <UButton
            v-if="telegramLink"
            :to="telegramLink"
            target="_blank"
            rel="noopener"
            color="neutral"
            variant="solid"
            class="min-h-11 bg-[#229ED9] text-white hover:bg-[#1c8bc0]"
            icon="i-simple-icons-telegram"
            :title="t('Svitlo.telegram.hint')"
          >
            {{ t('Svitlo.telegram.button') }}
          </UButton>
        </div>
      </SvitloStatusHero>

      <div class="flex gap-1" role="tablist" :aria-label="t('Svitlo.title')">
        <UButton
          v-for="d in tabs"
          :key="d.key"
          :to="localePath(d.path)"
          role="tab"
          :aria-selected="day === d.key"
          :color="day === d.key ? 'primary' : 'neutral'"
          :variant="day === d.key ? 'solid' : 'outline'"
          class="min-h-11 flex-1 justify-center sm:flex-none"
        >
          {{ d.label }}
        </UButton>
      </div>

      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-lg font-semibold">{{ dayLabel(shown.date) }}</h2>
            <div class="flex gap-1">
              <UButton
                v-for="v in ['line', 'ring'] as const"
                :key="v"
                size="sm"
                class="min-h-11"
                :color="view === v ? 'primary' : 'neutral'"
                :variant="view === v ? 'soft' : 'ghost'"
                :icon="v === 'line' ? 'i-lucide-chart-no-axes-gantt' : 'i-lucide-clock'"
                :aria-pressed="view === v"
                @click="setView(v)"
              >
                {{ t(`Svitlo.view.${v}`) }}
              </UButton>
            </div>
          </div>
        </template>

        <SvitloStateAlerts
          class="mb-4"
          :state="shown.publishedState === 'published' ? null : shown.publishedState"
          :emergency="data.emergency"
          :stale="data.stale"
          :sources-agree="day === 'today' ? data.sourcesAgree : null"
        />

        <template v-if="shown.publishedState !== 'not_published'">
          <SvitloDayTimeline v-if="view === 'line'" :day="shown" :now="day === 'today' ? now : null" class="mt-6" />
          <SvitloDayRing v-else :day="shown" :now="day === 'today' ? now : null" />
          <h3 class="mt-6 mb-1 text-base font-semibold">{{ t('Svitlo.intervals.title') }}</h3>
          <SvitloIntervalList :day="shown" :now="day === 'today' ? now : null" />
        </template>
      </UCard>

      <SvitloChangesFeed :changes="changes ?? []" :queue="data.queue" />

      <section>
        <h2 class="mb-2 text-base font-semibold">{{ t('Svitlo.otherQueues') }}</h2>
        <ul class="grid grid-cols-4 gap-2 sm:grid-cols-6">
          <li v-for="q in data.region.queues" :key="q">
            <UButton
              :to="localePath(`/svitlo-cherga/${region}/${queueToParam(q)}${day === 'tomorrow' ? '/zavtra' : ''}`)"
              block
              class="min-h-11 justify-center tabular-nums"
              :color="q === data.queue ? 'primary' : 'neutral'"
              :variant="q === data.queue ? 'solid' : 'outline'"
              :aria-current="q === data.queue ? 'page' : undefined"
            >
              {{ q }}
            </UButton>
          </li>
        </ul>
      </section>

      <SvitloSourceFooter
        :source="data.source"
        :official-url="data.region.official ? data.region.source.url : null"
        :region="region"
        :updated-at="data.sourceUpdatedAt"
        :checked-at="data.fetchedAt"
      />

      <ShareButtons :url="canonical" :page-object="{ title: shareTitle }" />
    </template>
  </main>
</template>

<script setup lang="ts">
import type { QueuePageData, ScheduleChange } from '#shared/types/svitlo';
import { DEFAULT_REGION, findRegion } from '#shared/utils/svitloRegions';
import { paramToQueue, queueToParam } from '#shared/utils/svitloTime';

const props = defineProps<{ region: string; queueParam: string; day: 'today' | 'tomorrow' }>();

const { t, locale, dayLabel, regionName, range } = useSvitloFormat();
const localePath = useLocalePath();
const config = useRuntimeConfig();
const now = useSvitloNow();
const toast = useToast();
const { saved, save } = useSvitloSavedQueue();

const queue = paramToQueue(props.queueParam);
const def = findRegion(props.region);
if (!def || !queue) throw createError({ statusCode: 404, statusMessage: 'Queue not found', fatal: true });

const { data, error } = await useFetch<QueuePageData>(`/api/svitlo/${props.region}/${props.queueParam}`, {
  key: `svitlo-q-${props.region}-${props.queueParam}`,
});
if (error.value?.statusCode === 404) {
  throw createError({ statusCode: 404, statusMessage: 'Queue not found', fatal: true });
}
const { data: changes } = useFetch<ScheduleChange[]>(`/api/svitlo/${props.region}/changes`, {
  query: { date: props.day },
  key: `svitlo-c-${props.region}-${props.day}`,
  lazy: true,
  server: false,
});

const view = ref<'line' | 'ring'>('line');
function setView(v: 'line' | 'ring') {
  view.value = v;
}
const name = computed(() => regionName(def));
const shown = computed(() => (props.day === 'today' ? data.value!.today : data.value!.tomorrow));
const base = `/svitlo-cherga/${props.region}/${queueToParam(queue)}`;
const regionPath = props.region === DEFAULT_REGION ? '/svitlo-cherga' : `/svitlo-cherga/${props.region}`;
const tabs = computed(() => [
  { key: 'today' as const, label: t('Svitlo.today'), path: base },
  { key: 'tomorrow' as const, label: t('Svitlo.tomorrow'), path: `${base}/zavtra` },
]);

// Deep link to the alerts bot: /start <region>_<queue> subscribes this queue.
const telegramBot = String(config.public.telegramBot || '').replace(/^@/, '');
const telegramLink = telegramBot ? `https://t.me/${telegramBot}?start=${props.region}_${queueToParam(queue)}` : null;

const isSaved = computed(() => saved.value?.region === props.region && saved.value.queue === queue);
function saveQueue() {
  save(props.region, queue!);
  toast.add({ title: t('Svitlo.picker.savedToast', { queue }), icon: 'i-lucide-bookmark-check', color: 'success' });
}

// SEO
const siteUrl = String(config.public.siteUrl || 'https://json63.pp.ua').replace(/\/$/, '');
const canonical = computed(() => `${siteUrl}${localePath(props.day === 'today' ? base : `${base}/zavtra`)}`);
const summary = computed(() => {
  if (!data.value) return '';
  const d = shown.value;
  if (d.publishedState === 'not_published') return t('Svitlo.summaryUnknown');
  if (!d.intervals.length) return t('Svitlo.summaryNone');
  return d.intervals.map((i) => range(i)).join(', ');
});
const title = computed(() =>
  t(props.day === 'today' ? 'Svitlo.queueTitle' : 'Svitlo.queueTitleTomorrow', { queue, region: name.value }),
);
const description = computed(() =>
  t('Svitlo.queueDescription', {
    queue,
    region: name.value,
    date: data.value ? dayLabel(shown.value.date) : '',
    summary: summary.value,
  }),
);
const shareTitle = computed(() => t('Svitlo.shareTitle', { queue, region: name.value }));

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonical,
  ogImage: `${siteUrl}/svitlo-cherga.jpg`,
  ogType: 'website',
  twitterCard: 'summary_large_image',
});
useHead({
  link: [{ rel: 'canonical', href: canonical }],
  meta: [{ name: 'theme-color', content: '#0057b7' }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'WebPage',
              name: title.value,
              description: description.value,
              url: canonical.value,
              inLanguage: locale.value === 'en' ? 'en' : 'uk',
              dateModified: data.value?.sourceUpdatedAt ?? data.value?.fetchedAt ?? undefined,
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
                { '@type': 'ListItem', position: 2, name: name.value, item: `${siteUrl}${localePath(regionPath)}` },
                { '@type': 'ListItem', position: 3, name: t('Svitlo.queue', { queue }), item: canonical.value },
              ],
            },
          ],
        }),
      ),
    },
  ],
});
</script>
