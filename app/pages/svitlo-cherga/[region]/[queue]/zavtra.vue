<template>
  <SvitloQueuePage :key="`${region}-${queue}-tomorrow`" :region="region" :queue-param="queue" day="tomorrow" />
</template>

<script setup lang="ts">
definePageMeta({ key: (route) => route.path });

const route = useRoute();
const region = computed(() => String(route.params.region));
const queue = computed(() => String(route.params.queue));
</script>
