<template>
  <SvitloQueuePage :key="`${region}-${queue}-today`" :region="region" :queue-param="queue" day="today" />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'svitlo', key: (route) => route.path });

const route = useRoute();
const region = computed(() => String(route.params.region));
const queue = computed(() => String(route.params.queue));
</script>
