<template>
  <div v-if="pageObject" class="share-buttons my-3 max-w-[800px] mx-auto px-2">
    <p class="text-lg text-center font-bold mb-1 dark:text-white">{{ $t('ShareButtons.sharedSocial') }}:</p>
    <div class="flex flex-wrap gap-4 justify-center py-3">
      <ShareButton
        v-if="facebookShareUrl"
        :url="facebookShareUrl"
        icon="/icons/facebook.png"
        label="Facebook"
        type="facebook"
        class="share-button"
      />
      <ShareButton
        v-if="viberShareUrl"
        :url="viberShareUrl"
        icon="/icons/viber.png"
        label="Viber"
        type="viber"
        class="share-button"
      />
      <ShareButton
        v-if="whatsappShareUrl"
        :url="whatsappShareUrl"
        icon="/icons/whatsapp.png"
        label="WhatsApp"
        type="whatsapp"
        class="share-button"
      />
      <ShareButton
        v-if="telegramShareUrl"
        :url="telegramShareUrl"
        icon="/icons/telegram.png"
        label="Telegram"
        type="telegram"
        class="share-button"
      />
    </div>
  </div>
  <div v-else>
    <p>Page data is not available.</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import ShareButton from './ShareButton.vue';

const props = defineProps({
  url: {
    type: String,
    default: '',
  },
  pageObject: {
    type: [Object, null],
    required: true,
    default: null,
  },
});

// ✨ Автоматичне визначення URL, якщо не передано
const currentUrl = computed(() => {
  if (props.url) return props.url;
  if (process.server) {
    const reqUrl = useRequestURL();
    return reqUrl.href;
  }
  if (process.client) {
    return window.location.href;
  }
  return '';
});

const facebookShareUrl = computed(() =>
  props.pageObject ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}` : '',
);

const viberShareUrl = computed(() =>
  props.pageObject
    ? `viber://forward?text=${encodeURIComponent(`${props.pageObject?.title || ''} - ${currentUrl.value}`)}`
    : '',
);

const whatsappShareUrl = computed(() =>
  props.pageObject
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`${props.pageObject?.title || ''} - ${currentUrl.value}`)}`
    : '',
);

const telegramShareUrl = computed(() =>
  props.pageObject
    ? `https://t.me/share/url?url=${encodeURIComponent(currentUrl.value)}&text=${encodeURIComponent(props.pageObject?.title || '')}`
    : '',
);
</script>
