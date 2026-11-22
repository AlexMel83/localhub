<template>
  <SvitloRegionPage :region="region" />
</template>

<script setup lang="ts">
definePageMeta({ key: (route) => route.path });

const route = useRoute();
const region = String(route.params.region);
</script>
