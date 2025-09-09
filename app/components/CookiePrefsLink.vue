<template>
  <div class="links">
    <NuxtLink to="" @click.native="showCookiePrefs" class="cursor-pointer"><slot></slot></NuxtLink>
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
