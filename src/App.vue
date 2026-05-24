<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useAppStore } from './stores/appStore'
import AppToast from './components/shared/AppToast.vue'

const store = useAppStore()

const userFirstName = computed(() => store.currentUser?.name.split(' ')[0] ?? '')
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

          <nav class="flex flex-wrap items-center justify-end gap-2 text-xs sm:text-sm">
            <RouterLink
              v-if="store.currentUser"
              to="/profile/appointments"
              class="am-btn-secondary"
            >
              Мои записи
            </RouterLink>
            <span
              v-if="store.currentUser"
              class="hidden text-xs text-slate-400 sm:inline"
            >
              {{ userFirstName }}
            </span>
            <button
              v-if="store.currentUser"
              type="button"
              class="am-btn-secondary"
              @click="store.logoutUser()"
            >
              Выйти
            </button>
            <RouterLink
              v-else
              to="/login"
              class="am-btn-secondary"
            >
              Войти
            </RouterLink>
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
