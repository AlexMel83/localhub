<template>
  <div class="svitlo-page">
    <main class="mx-auto w-full max-w-[1320px] space-y-6 px-4 py-6 sm:px-10 sm:py-10">
      <nav
        class="flex flex-wrap items-center gap-x-2 text-sm text-[var(--svitlo-muted)]"
        :aria-label="t('Svitlo.title')"
      >
        <NuxtLink :to="localePath('/svitlo-cherga')" class="inline-flex min-h-11 items-center hover:underline">{{
          t('Svitlo.title')
        }}</NuxtLink>
        <span aria-hidden="true">/</span>
        <NuxtLink :to="localePath(regionPath)" class="inline-flex min-h-11 items-center hover:underline">{{
          name
        }}</NuxtLink>
        <span aria-hidden="true">/</span>
        <span class="text-[var(--svitlo-ink)]" aria-current="page">{{ t('Svitlo.queue', { queue }) }}</span>
      </nav>

      <SvitloStateAlerts v-if="error || !data" error />
      <div v-else class="grid items-start gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-4">
        <div class="flex flex-col gap-4 lg:sticky lg:top-4">
          <SvitloStatusHero
            :queue="data.queue"
            :region-name="name"
            :today="data.today"
            :tomorrow="data.tomorrow"
            :now="now"
          >
            <template #aside>
              <UButton
                :to="localePath(regionPath)"
                color="neutral"
                variant="outline"
                class="min-h-11 shrink-0 font-bold tracking-wide uppercase"
              >
                {{ t('Svitlo.picker.change') }}
              </UButton>
            </template>
            <div class="flex flex-col gap-2">
              <template v-if="telegramLink">
                <UButton
                  :to="telegramLink"
                  target="_blank"
                  rel="noopener"
                  size="xl"
                  block
                  class="min-h-13 font-bold tracking-wide uppercase"
                  icon="i-lucide-send"
                >
                  {{ t('Svitlo.telegram.button') }}
                </UButton>
                <p class="text-center text-[13px] text-[var(--svitlo-muted)]">{{ t('Svitlo.telegram.hint') }}</p>
              </template>
              <UButton
                v-if="!isSaved"
                color="neutral"
                variant="outline"
                size="lg"
                block
                class="min-h-12 font-bold tracking-wide uppercase"
                icon="i-lucide-bookmark"
                @click="saveQueue"
              >
                {{ t('Svitlo.picker.save') }}
              </UButton>
              <p v-else class="inline-flex items-center justify-center gap-2 text-sm font-bold">
                <UIcon name="i-lucide-bookmark-check" class="size-4" aria-hidden="true" />
                {{ t('Svitlo.picker.yourQueue', { queue: data.queue }) }}
              </p>
            </div>
          </SvitloStatusHero>

          <SvitloSourceFooter
            class="hidden lg:block"
            :source="data.source"
            :official-url="data.region.official ? data.region.source.url : null"
            :region="region"
            :updated-at="data.sourceUpdatedAt"
            :checked-at="data.fetchedAt"
          />
        </div>

        <div class="flex min-w-0 flex-col gap-5">
          <div class="grid grid-cols-2 gap-2" role="tablist" :aria-label="t('Svitlo.title')">
            <NuxtLink
              v-for="d in tabs"
              :key="d.key"
              :to="localePath(d.path)"
              role="tab"
              :aria-selected="day === d.key"
              class="svitlo-cut-lg block p-px"
              :class="day === d.key ? 'bg-[var(--svitlo-accent)]' : 'bg-[var(--svitlo-line-strong)]'"
            >
              <span
                class="svitlo-cut-lg flex min-h-15 flex-col items-center justify-center px-2 text-center"
                :class="
                  day === d.key
                    ? 'bg-[var(--svitlo-accent)] text-black'
                    : 'bg-[var(--svitlo-surface)] text-[var(--svitlo-ink)]'
                "
              >
                <span class="svitlo-display text-lg leading-none">{{ d.label }}</span>
                <span class="text-[13px]">{{ d.date }}</span>
              </span>
            </NuxtLink>
          </div>

          <section class="flex flex-col gap-4" :aria-label="dayLabel(shown.date)">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <h2 class="svitlo-display text-2xl sm:text-3xl">{{ dayLabel(shown.date) }}</h2>
              <div
                v-if="shown.publishedState !== 'not_published'"
                class="flex overflow-hidden rounded-sm border border-[var(--svitlo-line-strong)]"
                role="group"
              >
                <button
                  v-for="v in ['line', 'ring'] as const"
                  :key="v"
                  type="button"
                  class="min-h-11 px-4 text-[13px] font-bold tracking-wide uppercase"
                  :class="v === view ? 'bg-[var(--svitlo-accent)] text-black' : 'text-[var(--svitlo-ink)]'"
                  :aria-pressed="view === v"
                  @click="setView(v)"
                >
                  {{ t(`Svitlo.view.${v}`) }}
                </button>
              </div>
            </div>

            <SvitloStateAlerts
              :state="shown.publishedState === 'published' ? null : shown.publishedState"
              :emergency="data.emergency"
              :stale="data.stale"
              :sources-agree="day === 'today' ? data.sourcesAgree : null"
            />

            <template v-if="shown.publishedState !== 'not_published'">
              <SvitloDayTimeline v-if="view === 'line'" :day="shown" :now="day === 'today' ? now : null" />
              <div v-else class="svitlo-card px-3 py-6">
                <SvitloDayRing :day="shown" :now="day === 'today' ? now : null" />
              </div>
              <SvitloIntervalList :day="shown" :now="day === 'today' ? now : null" />
            </template>
          </section>

          <SvitloChangesFeed :changes="changes ?? []" :queue="data.queue" />

          <section class="flex flex-col gap-3">
            <h2 class="svitlo-display text-2xl">{{ t('Svitlo.otherQueues') }}</h2>
            <ul class="grid grid-cols-4 gap-2 sm:grid-cols-6">
              <li v-for="q in data.region.queues" :key="q">
                <NuxtLink
                  :to="localePath(`/svitlo-cherga/${region}/${queueToParam(q)}${day === 'tomorrow' ? '/zavtra' : ''}`)"
                  class="svitlo-display flex min-h-12 items-center justify-center border text-xl tabular-nums"
                  :class="
                    q === data.queue
                      ? 'border-[var(--svitlo-accent)] bg-[var(--svitlo-accent)] text-black'
                      : 'border-[var(--svitlo-line-strong)] hover:border-[var(--svitlo-accent)]'
                  "
                  :aria-current="q === data.queue ? 'page' : undefined"
                >
                  {{ q }}
                </NuxtLink>
              </li>
            </ul>
          </section>

          <SvitloSourceFooter
            class="lg:hidden"
            :source="data.source"
            :official-url="data.region.official ? data.region.source.url : null"
            :region="region"
            :updated-at="data.sourceUpdatedAt"
            :checked-at="data.fetchedAt"
          />

          <SvitloShare :url="canonical" :title="shareTitle" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import type { QueuePageData, ScheduleChange } from '#shared/types/svitlo';
import { DEFAULT_REGION, findRegion, STANDARD_QUEUES } from '#shared/utils/svitloRegions';
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

// Keep pages without a published schedule out of the index (thin/duplicate),
// but let them back in as soon as the operator publishes one.
const indexable = computed(() => {
  if (error.value || !data.value) return false;
  const day = props.day === 'today' ? data.value.today : data.value.tomorrow;
  return day.publishedState !== 'not_published';
});
useRobotsRule(indexable.value ? true : 'noindex, follow');
const base = `/svitlo-cherga/${props.region}/${queueToParam(queue)}`;
const regionPath = props.region === DEFAULT_REGION ? '/svitlo-cherga' : `/svitlo-cherga/${props.region}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const shortDate = (date?: string) =>
  date
    ? new Intl.DateTimeFormat(locale.value === 'en' ? 'en-GB' : 'uk-UA', {
        timeZone: 'Europe/Kyiv',
        day: 'numeric',
        month: 'long',
      }).format(new Date(`${date}T12:00:00Z`))
    : '';
const tabs = computed(() => [
  { key: 'today' as const, label: t('Svitlo.today'), path: base, date: shortDate(data.value?.today.date) },
  {
    key: 'tomorrow' as const,
    label: t('Svitlo.tomorrow'),
    path: `${base}/zavtra`,
    date: shortDate(data.value?.tomorrow.date),
  },
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
  return t('Svitlo.summaryOff', { ranges: d.intervals.map((i) => range(i)).join(', ') });
});
const title = computed(() =>
  t(props.day === 'today' ? 'Svitlo.queueTitle' : 'Svitlo.queueTitleTomorrow', { queue, region: name.value }),
);
const description = computed(() =>
  t('Svitlo.queueDescription', {
    queue,
    region: name.value,
    date: data.value ? capitalize(dayLabel(shown.value.date)) : '',
    summary: summary.value,
  }),
);
const shareTitle = computed(() => t('Svitlo.shareTitle', { queue, region: name.value }));

// Branded preview card per queue number (public/svitlo/og/<1-1>.jpg), a generic one otherwise.
const ogImage = `${siteUrl}/svitlo/og/${STANDARD_QUEUES.includes(queue) ? queueToParam(queue) : 'default'}.jpg`;

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: canonical,
  ogSiteName: () => t('Svitlo.ogSiteName'),
  ogLocale: () => (locale.value === 'en' ? 'en_US' : 'uk_UA'),
  ogImage,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: () => t('Svitlo.queue', { queue }),
  ogType: 'website',
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
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
