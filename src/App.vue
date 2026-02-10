<script setup>
import { RouterLink, RouterView } from 'vue-router'
import AppToast from './components/shared/AppToast.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-0 h-[260px] bg-gradient-to-br from-indigo-600/60 via-sky-500/40 to-emerald-500/30 blur-3xl"
    />

    <div class="relative z-10 flex min-h-screen flex-col">
      <header
        class="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md"
      >
        <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <RouterLink
            to="/"
            class="flex items-center gap-3"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 shadow-md shadow-slate-900/40 ring-1 ring-slate-700/70"
            >
              <span class="text-lg font-black tracking-tight text-indigo-400">AM</span>
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
                Автосервис
              </span>
              <span class="text-lg font-semibold text-slate-50">
                АвтоМастер
              </span>
            </div>
          </RouterLink>

          <nav class="flex items-center gap-2 text-xs sm:text-sm">
            <RouterLink
              to="/admin/login"
              class="am-btn-primary"
            >
              Панель администратора
            </RouterLink>
          </nav>
        </div>
      </header>

      <main class="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-4 sm:px-6 sm:py-6">
        <RouterView />
      </main>

      <footer class="border-t border-slate-800/80 bg-slate-950/80">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-xs text-slate-500 sm:px-6">
          <span>© {{ new Date().getFullYear() }} АвтоМастер. Все права защищены.</span>
          <span class="hidden sm:inline">
            Современная информационная система автосервиса.
          </span>
        </div>
      </footer>

      <AppToast />
    </div>
  </div>
</template>

