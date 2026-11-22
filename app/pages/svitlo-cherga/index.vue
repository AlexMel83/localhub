<template>
  <SvitloRegionPage :region="DEFAULT_REGION" />
</template>

<script setup lang="ts">
import { DEFAULT_REGION, SVITLO_REGIONS } from '#shared/utils/svitloRegions';
import { paramToQueue, queueToParam } from '#shared/utils/svitloTime';

// Old links used ?region=<svitlo cpu>&queue=<1.1|all>; send them to the new URLs.
const route = useRoute();
const localePath = useLocalePath();
const legacyRegion = typeof route.query.region === 'string' ? route.query.region : null;
const legacyQueue = typeof route.query.queue === 'string' ? paramToQueue(route.query.queue) : null;
if (legacyRegion || legacyQueue) {
  const region =
    SVITLO_REGIONS.find((r) => r.slug === legacyRegion || r.legacyCpu === legacyRegion || r.dtekCpu === legacyRegion)
      ?.slug ?? DEFAULT_REGION;
  const path = legacyQueue
    ? `/svitlo-cherga/${region}/${queueToParam(legacyQueue)}`
    : region === DEFAULT_REGION
      ? '/svitlo-cherga'
      : `/svitlo-cherga/${region}`;
  await navigateTo(localePath(path), { redirectCode: 301 });
}
</script>
