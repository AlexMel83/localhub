<template>
  <div />
</template>

<script setup>
const props = defineProps({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  url: { type: String, default: '' },
  keywords: { type: String, default: '' },
  structuredData: { type: Object, default: null },
});

// Базова URL (SSR-safe)
const config = useRuntimeConfig();
const route = useRoute();
const baseUrl = config.public.baseURL || 'https://localhub.store';
const { locale } = useI18n();

// Повна URL-адреса сторінки
const currentUrl = computed(() => {
  return props.url || `${baseUrl}${route.path}`;
});

// Повна URL для зображення з обробкою помилок
const urlImage = computed(() => {
  if (!props.image) return 'https://localhub.store/panoimg/Mototehnika.jpg';
  return props.image.startsWith('http')
    ? props.image
    : `https://localhub.store${props.image.startsWith('/') ? '' : '/'}${props.image}`;
});

const localizedTitle = computed(() => {
  return locale.value === 'uk' ? `${props.title}` : props.title;
});

const localizedDescription = computed(() => {
  const baseDesc =
    locale.value === 'uk'
      ? 'Це платформа для підтримки внутрішньо переміщених осіб (ВПО) та сприяння їх інтеграції в місцеву громаду. Ми надаємо інформацію, ресурси та допомогу ВПО, а також сприяємо партнерствам між ВПО, місцевими організаціями та владою.'
      : props.description || '';
  return baseDesc.length > 150 ? baseDesc.slice(0, 150) + '...' : baseDesc;
});

const enhancedStructuredData = computed(() => {
  if (!props.structuredData) return null;
  return {
    ...props.structuredData,
    description: `${props.description || ''}}`,
  };
});

useHead({
  htmlAttrs: {
    lang: locale.value === 'en' ? 'en-US' : 'uk-UA',
  },
  title: localizedTitle.value,
  link: [{ rel: 'canonical', href: currentUrl.value }],
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'robots', content: 'index, follow' },
    { name: 'canonical', content: currentUrl.value },
    { name: 'description', content: props.description },
    { name: 'application-name', content: 'IT-Starkon' },
    { name: 'theme-color', content: '#0057b7' },
    { name: 'keywords', content: props.keywords },
    { name: 'author', content: 'LocalHub Старокостянтинів' },
    // OpenGraph
    { property: 'og:title', content: localizedTitle.value },
    { property: 'og:description', content: localizedDescription.value },
    { property: 'og:type', content: 'article' },
    { property: 'og:site_name', content: 'LocalHub Старокостянтинів' },
    { property: 'og:image', content: urlImage.value },
    { property: 'og:image:secure_url', content: urlImage.value },
    { property: 'og:image:type', content: 'image/jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'Рада з питань ВПО' },
    { property: 'og:url', content: currentUrl.value },
    { property: 'og:locale', content: locale.value === 'en' ? 'en_US' : 'uk_UA' },
    { property: 'fb:app_id', content: config.public.facebookAppId || '714008411407083' },
    // Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: localizedTitle.value },
    { name: 'twitter:description', content: localizedDescription.value },
    { name: 'twitter:image', content: urlImage.value },
    { name: 'twitter:site', content: '@cfhope' },
    { name: 'twitter:creator', content: '@cfhope' },
  ],
  script: enhancedStructuredData.value
    ? [
        {
          type: 'application/ld+json',
          children: JSON.stringify(enhancedStructuredData.value),
        },
      ]
    : [],
});
</script>
