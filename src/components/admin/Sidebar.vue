<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../../stores/appStore'
import {
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  PowerIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const store = useAppStore()

const links = [
  {
    name: 'Услуги',
    routeName: 'admin-services',
    icon: WrenchScrewdriverIcon,
  },
  {
    name: 'Записи',
    routeName: 'admin-appointments',
    icon: CalendarDaysIcon,
  },
  {
    name: 'Отзывы',
    routeName: 'admin-reviews',
    icon: ChatBubbleLeftRightIcon,
  },
]

const isActive = (routeName) =>
  computed(() => route.name === routeName)

const logout = () => {
  store.logoutAdmin()
  router.push({ name: 'admin-login' })

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'info',
        message: 'Вы вышли из панели администратора.',
      },
    })
  )
}
</script>

<template>
  <nav class="am-section flex h-full flex-col gap-4">
    <header class="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Панель администратора
        </p>
        <p class="text-xs text-slate-500">
          Управление услугами и расписанием.
        </p>
      </div>
      <Cog6ToothIcon class="h-5 w-5 text-slate-500" />
    </header>

    <ul class="flex flex-1 flex-col gap-1 text-sm">
      <li
        v-for="link in links"
        :key="link.routeName"
      >
        <button
          type="button"
          class="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-all duration-150"
          :class="
            isActive(link.routeName).value
              ? 'bg-indigo-600/20 text-indigo-100 ring-1 ring-indigo-500/60'
              : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-50'
          "
          @click="router.push({ name: link.routeName })"
        >
          <component
            :is="link.icon"
            class="h-4 w-4"
          />
          <span>{{ link.name }}</span>
        </button>
      </li>
    </ul>

    <button
      type="button"
      class="am-btn-secondary mt-auto justify-center text-xs"
      @click="logout"
    >
      <PowerIcon class="h-4 w-4" />
      <span>Выйти</span>
    </button>
  </nav>
</template>

