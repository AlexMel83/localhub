<template>
  <nav class="w-full flex flex-col h-[60px] px-3 pt-2 fixed top-0 z-[1500] bg-transparent">
    <div class="container flex justify-between items-center">
      <div>
        <NuxtLink to="/">
          <NuxtImg src="Localhub-logo-320.jpg" class="h-full max-h-[40px] sm:max-h-[60px] object-contain" />
        </NuxtLink>
      </div>
      <HeaderButtons @toggle-search="toggleSearch" />
    </div>
    <div class="ml-auto">
      <HeaderSearchInput v-if="isSearchVisible" />
    </div>
  </nav>
</template>

<script setup>
const isSearchVisible = ref(false);

const toggleSearch = () => {
  isSearchVisible.value = !isSearchVisible.value;
};
</script>
