<template>
  <div class="w-full py-1 pr-2">
    <UInput
      v-model="searchTerm"
      name="searchTerm"
      :placeholder="$t('header.search')"
      autocomplete="off"
      color="neutral"
      :ui="{ icon: { trailing: { pointer: '' } } }"
    >
      <template #leading>
        <Icon name="mdi-light:magnify" />
      </template>
      <template #trailing>
        <UButton v-if="searchTerm !== ''" color="gray" variant="link" :padded="false" @click="clearSearch">
          <Icon name="material-symbols:close-small" />
        </UButton>
      </template>
    </UInput>
  </div>
</template>

<script setup>
import { useAppStore } from '~/stores/app.store';
const appStore = useAppStore();

const searchTerm = computed({
  get: () => appStore.searchTerm,
  set: (value) => appStore.setSearchTerm(value),
});

const clearSearch = () => {
  searchTerm.value = '';
};
</script>
