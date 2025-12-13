<template>
  <UModal
    v-model="isModalOpen"
    :ui="{ width: 'max-w-md' }"
    title="Вхід / Реєстрація"
    description="Увійдіть або зареєструйтесь для продовження"
    :close="{
      color: 'primary',
      variant: 'outline',
      class: 'rounded-full',
    }"
  >
    <template #default="{ open }">
      <button ref="modalTrigger" class="hidden" @click="open" />
    </template>

    <template #content> content </template>
  </UModal>
</template>

<script setup>
import { useModalStore } from '~/stores/modal.store';

const modalStore = useModalStore();
const modalTrigger = ref(null);
const isModalOpen = ref(false);

defineExpose({ openModal: () => modalStore.openLoginModal() });

watch(
  () => modalStore.isLoginModalOpen,
  (newValue) => {
    if (newValue && !isModalOpen.value) {
      // Відкриваємо модалку
      nextTick(() => {
        modalTrigger.value?.click();
      });
    } else if (!newValue && isModalOpen.value) {
      // Закриваємо модалку
      isModalOpen.value = false;
    }
  },
);

// // Синхронізуємо локальний ref зі store
// watch(isModalOpen, (newValue) => {
//   if (!newValue) {
//     modalStore.closeLoginModal();
//   }
// });
</script>

<style scoped>
.password-input-wrapper {
  position: relative;
}
.password-toggle {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}
.input-error {
  color: red;
}
.form-group {
  position: relative;
  margin: 1.4rem 0;
  transition: all 0.3s ease;
}

.form-group label {
  position: absolute;
  top: 85%;
  left: 35px;
  transform: translateY(-90%);
  transition: all 0.3s;
  pointer-events: none;
  color: #999;
  z-index: 10;
  font-size: 125%;
}

.form-group.has-value label,
.form-group input:focus + label {
  top: 8px;
  left: 0;
}
</style>
