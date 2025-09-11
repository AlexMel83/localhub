<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue'; // Видалено onMounted
import { useHead } from '@unhead/vue';
import type { ResolvableProperties, HtmlAttr } from '@unhead/vue';

interface Locale {
  lang: string;
  dir: 'rtl' | 'ltr' | 'auto' | undefined;
  name?: string;
}

const { locale } = useI18n();

const currentLocale = computed<Locale>(() => {
  const code = locale.value || 'uk';
  const dir = code === 'ar' || code === 'he' ? 'rtl' : 'ltr';
  return { lang: code, dir, name: code.toUpperCase() };
});

useHead({
  htmlAttrs: computed<ResolvableProperties<HtmlAttr>>(() => ({
    lang: currentLocale.value.lang,
    dir: currentLocale.value.dir,
  })),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);
</script>
