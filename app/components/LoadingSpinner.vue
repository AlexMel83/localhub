<template>
  <div class="h-full w-full py-2 gap-2 flex items-center justify-center space-x-2">
    <span class="loading-bar" />
    <span class="loading-bar" />
    <span class="loading-bar" />
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
};
</script>

<style scoped>
.loading-bar {
  display: block;
  width: 20px;
  height: 35px;
  background-color: #c4c4c4;
  border-radius: 2px;
  animation: pulse 1.2s infinite ease-in-out;
}

/* Добавляем задержку для каждого прямоугольника */
.loading-bar:nth-child(1) {
  animation-delay: -0.24s;
}

.loading-bar:nth-child(2) {
  animation-delay: -0.12s;
}

.loading-bar:nth-child(3) {
  animation-delay: 0;
}

@keyframes pulse {
  0%,
  100% {
    background-color: #c4c4c4;
  }
  50% {
    background-color: #8e8e8e;
  }
}
</style>
