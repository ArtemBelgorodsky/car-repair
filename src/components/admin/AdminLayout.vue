<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './Sidebar.vue'
</script>

<template>
  <div class="flex min-h-[calc(100vh-120px)] flex-1 gap-4 py-2 sm:py-4">
    <aside class="w-60 shrink-0">
      <Sidebar />
    </aside>
    <section class="flex min-w-0 flex-1 flex-col">
      <RouterView />
    </section>
  </div>
</template>

