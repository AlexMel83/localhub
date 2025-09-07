<template>
  <div />
</template>

<script setup>
const props = defineProps({
  url: { type: String, default: '' },
  title: { type: String, default: 'Default Title' },
  description: { type: String, default: 'Default description for LocalHub' },
  image: { type: String, default: '/default-image.jpg' },
  keywords: { type: String, default: '' },
  type: { type: String, default: 'article' },

  // Додатково для LocalBusiness schema
  businessType: { type: String, default: 'LocalBusiness' }, // наприклад: "AutoRepair", "Restaurant", "Store"
  businessName: { type: String, default: 'LocalHub Business' },
  businessDescription: { type: String, default: 'Опис бізнесу' },
  businessPhone: { type: String, default: '' },
  businessEmail: { type: String, default: '' },
  businessUrl: { type: String, default: '' },
  businessLogo: { type: String, default: '/logo.png' },
  businessAddress: {
    type: Object,
    default: () => ({
      streetAddress: '',
      addressLocality: 'Старокостянтинів',
      addressRegion: 'Хмельницька область',
      postalCode: '',
      addressCountry: 'UA',
    }),
  },
  businessGeo: {
    type: Object,
    default: () => ({
      latitude: null,
      longitude: null,
    }),
  },
  businessOpeningHours: {
    type: Array,
    default: () => ['Mo-Fr 09:00-18:00', 'Sa 10:00-15:00'],
  },
  faq: {
    type: Array,
    default: () => [],
  },
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
  return locale.value === 'uk' ? props.title : props.title;
});

const localizedDescription = computed(() => {
  const baseDesc = locale.value === 'uk' ? props.description || '' : props.description || '';
  return baseDesc.length > 150 ? baseDesc.slice(0, 150) + '...' : baseDesc;
});

const enhancedStructuredData = computed(() => {
  if (!props.structuredData) return null;
  return {
    ...props.structuredData,
    description: `${props.description || ''}}`,
  };
});

const businessStructuredData = computed(() => {
  return {
    '@context': 'https://schema.org',
    '@type': props.businessType,
    name: props.businessName,
    description: props.businessDescription,
    image: props.image || props.businessLogo,
    logo: props.businessLogo,
    url: props.businessUrl || props.url,
    telephone: props.businessPhone,
    email: props.businessEmail,
    address: {
      '@type': 'PostalAddress',
      streetAddress: props.businessAddress.streetAddress,
      addressLocality: props.businessAddress.addressLocality,
      addressRegion: props.businessAddress.addressRegion,
      postalCode: props.businessAddress.postalCode,
      addressCountry: props.businessAddress.addressCountry,
    },
    ...(props.businessGeo.latitude && props.businessGeo.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: props.businessGeo.latitude,
            longitude: props.businessGeo.longitude,
          },
        }
      : {}),
    openingHours: props.businessOpeningHours,
  };
});

const faqStructuredData = computed(() => {
  if (!props.faq.length) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
});

useHead({
  htmlAttrs: {
    lang: locale.value === 'en' ? 'en-US' : 'uk-UA',
  },
  title: localizedTitle.value || 'LocalHub Старокостянтинів',
  link: [{ rel: 'canonical', href: currentUrl.value }],
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'robots', content: 'index, follow' },
    { name: 'description', content: localizedDescription.value },
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
    { property: 'og:url', content: currentUrl.value },
    { property: 'og:locale', content: locale.value === 'en' ? 'en_US' : 'uk_UA' },
    { property: 'og:image:alt', content: 'LocalHub Старокостянтинів' },
    { property: 'og:url', content: currentUrl.value },
    { property: 'fb:app_id', content: config.public.facebookAppId || '714008411407083' },
    // Twitter Cards
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: localizedTitle.value },
    { name: 'twitter:description', content: localizedDescription.value },
    { name: 'twitter:image', content: urlImage.value },
    { name: 'twitter:site', content: '@cfhope' },
    { name: 'twitter:creator', content: '@cfhope' },
  ],
  script: [
    ...(enhancedStructuredData.value
      ? [{ type: 'application/ld+json', children: JSON.stringify(enhancedStructuredData.value) }]
      : []),
    ...(businessStructuredData.value
      ? [{ type: 'application/ld+json', children: JSON.stringify(businessStructuredData.value) }]
      : []),
    ...(faqStructuredData.value
      ? [{ type: 'application/ld+json', children: JSON.stringify(faqStructuredData.value) }]
      : []),
  ],
});
</script>
