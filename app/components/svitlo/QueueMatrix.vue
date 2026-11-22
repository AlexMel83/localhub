<template>
  <section class="space-y-3">
    <div v-if="offNow !== null" class="flex flex-col gap-2.5">
      <h3 class="svitlo-display text-xl">{{ t('Svitlo.matrix.offNowTitle') }}</h3>
      <ul v-if="offNow.length" class="grid grid-cols-3 gap-2 sm:grid-cols-6">
        <li v-for="o in offNow" :key="o.queue">
          <NuxtLink
            :to="queueLink(o.queue)"
            class="svitlo-slot-off flex min-h-18 flex-col justify-center border border-[var(--svitlo-line)] px-3 py-2 text-white"
          >
            <span class="svitlo-display text-2xl">{{ o.queue }}</span>
            <span class="text-[13px]">{{ t('Svitlo.matrix.until', { time: o.until }) }}</span>
          </NuxtLink>
        </li>
      </ul>
      <p v-else class="flex items-center gap-2 text-sm font-medium">
        <UIcon name="i-lucide-lightbulb" class="size-4 shrink-0" aria-hidden="true" />{{
          t('Svitlo.matrix.noneOffNow')
        }}
      </p>
    </div>
    <div class="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table class="w-full min-w-[640px] border-separate border-spacing-y-1 text-xs">
        <caption class="sr-only">
          {{
            t('Svitlo.matrix.title')
          }}
        </caption>
        <thead>
          <tr>
            <th scope="col" class="w-16 text-left font-medium text-muted">
              {{ t('Svitlo.queue', { queue: '' }).trim() }}
            </th>
            <th
              v-for="h in 24"
              :key="h"
              scope="col"
              class="text-center font-medium tabular-nums"
              :class="currentHour === h - 1 ? 'text-primary' : 'text-muted'"
            >
              {{ String(h - 1).padStart(2, '0') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in queues" :key="q.queue" :class="highlight === q.queue && 'outline-2 outline-primary rounded'">
            <th scope="row" class="pr-2 text-left">
              <NuxtLink
                :to="queueLink(q.queue)"
                class="svitlo-display inline-flex min-h-8 items-center text-base hover:underline"
                :class="highlight === q.queue && 'text-primary'"
              >
                {{ q.queue }}
              </NuxtLink>
            </th>
            <td v-for="h in 24" :key="h" class="p-0" :class="currentHour === h - 1 && 'bg-primary/10'">
              <div class="flex h-7 gap-px overflow-hidden">
                <span
                  v-for="half in [0, 1]"
                  :key="half"
                  class="h-full w-1/2"
                  :class="`svitlo-slot-${q.slots[(h - 1) * 2 + half]}`"
                  :style="slotNow !== null && (h - 1) * 2 + half < slotNow ? { opacity: 0.4 } : undefined"
                  :title="`${q.queue} ${slotLabel((h - 1) * 2 + half)} — ${t(`Svitlo.legend.${q.slots[(h - 1) * 2 + half]}`)}`"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { QueueDay } from '#shared/types/svitlo';
import { kyivLocalToDate, slotLabel } from '#shared/utils/svitloSlots';
import { queueToParam } from '#shared/utils/svitloTime';

const props = withDefaults(
  defineProps<{
    region: string;
    date: string;
    queues: QueueDay[];
    now?: number | null;
    highlight?: string | null;
    tomorrow?: boolean;
  }>(),
  { now: null, highlight: null, tomorrow: false },
);

const { t } = useSvitloFormat();
const localePath = useLocalePath();

const queueLink = (queue: string) =>
  localePath(`/svitlo-cherga/${props.region}/${queueToParam(queue)}${props.tomorrow ? '/zavtra' : ''}`);

const slotNow = computed(() => {
  if (props.now === null) return null;
  const start = kyivLocalToDate(props.date, 0).getTime();
  const end = kyivLocalToDate(props.date, 1440).getTime();
  if (props.now < start || props.now >= end) return null;
  const local = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .format(props.now)
      .replace(':', ''),
  );
  return Math.floor(local / 100) * 2 + (local % 100 >= 30 ? 1 : 0);
});

const currentHour = computed(() => (slotNow.value === null ? null : Math.floor(slotNow.value / 2)));

const slotTime = (i: number) => `${String(Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`;

const offNow = computed(() => {
  const i = slotNow.value;
  if (i === null) return null;
  return props.queues
    .filter((q) => q.slots[i] === 'off')
    .map((q) => {
      let end = i;
      while (end < q.slots.length && q.slots[end] === 'off') end++;
      return { queue: q.queue, until: slotTime(end) };
    });
});
</script>
