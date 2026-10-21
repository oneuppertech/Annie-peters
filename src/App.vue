<script setup lang="ts">
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
</script>

<template>
  <main>
    <RouterView />
  </main>
</template>

<style>
.v-btn {
  text-transform: none;
}
</style>
