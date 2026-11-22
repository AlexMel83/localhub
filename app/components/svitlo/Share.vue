<template>
  <section class="flex flex-col gap-3" :aria-labelledby="headingId">
    <h2 :id="headingId" class="svitlo-display text-2xl">{{ t('Svitlo.share.title') }}</h2>
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <a
        v-for="s in services"
        :key="s.name"
        :href="s.href"
        target="_blank"
        rel="noopener"
        class="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-[var(--svitlo-line-strong)] text-[13px] font-bold tracking-wide uppercase transition-colors duration-200 hover:border-[var(--svitlo-accent)] hover:text-[var(--svitlo-accent-ink)]"
      >
        <UIcon :name="s.icon" class="size-5" aria-hidden="true" />{{ s.name }}
      </a>
    </div>
    <button
      type="button"
      class="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--svitlo-accent)] px-5 text-[13px] font-bold tracking-wide text-black uppercase sm:self-start"
      @click="shareOrCopy"
    >
      <UIcon :name="canShare ? 'i-lucide-share-2' : 'i-lucide-link'" class="size-5" aria-hidden="true" />
      {{ canShare ? t('Svitlo.share.native') : t('Svitlo.share.copy') }}
    </button>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{ url: string; title: string }>();

const { t } = useI18n();
const toast = useToast();
const headingId = useId();

const services = computed(() => {
  const u = encodeURIComponent(props.url);
  const text = encodeURIComponent(`${props.title} – ${props.url}`);
  return [
    { name: 'Viber', icon: 'i-simple-icons-viber', href: `viber://forward?text=${text}` },
    {
      name: 'Telegram',
      icon: 'i-simple-icons-telegram',
      href: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(props.title)}`,
    },
    { name: 'WhatsApp', icon: 'i-simple-icons-whatsapp', href: `https://api.whatsapp.com/send?text=${text}` },
    { name: 'Facebook', icon: 'i-simple-icons-facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];
});

// The native share sheet exists only on the client (mostly phones).
const canShare = ref(false);
onMounted(() => {
  canShare.value = typeof navigator.share === 'function';
});

async function shareOrCopy() {
  if (canShare.value) {
    try {
      await navigator.share({ title: props.title, url: props.url });
    } catch {
      // Dismissed by the user: nothing to do.
    }
    return;
  }
  try {
    await navigator.clipboard.writeText(props.url);
    toast.add({ title: t('Svitlo.share.copied'), icon: 'i-lucide-check', color: 'success' });
  } catch {
    toast.add({ title: props.url, color: 'neutral' });
  }
}
</script>
