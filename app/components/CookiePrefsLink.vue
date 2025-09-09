<template>
  <div class="links">
    <NuxtLink to="" class="cursor-pointer" @click="showCookiePrefs"><slot /></NuxtLink>
  </div>
</template>

<script>
export default {
  methods: {
    showCookiePrefs() {
      this.$cookies.modal = true;
    },
  },
};
</script>
