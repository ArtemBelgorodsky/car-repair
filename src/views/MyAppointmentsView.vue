<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import {
  CalendarDaysIcon,
  ClockIcon,
  NoSymbolIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const store = useAppStore()

const servicesMap = computed(() => {
  const map = new Map()
  store.services.forEach((service) => map.set(service.id, service))
  return map
})

const statusClass = (status) => {
  switch (status) {
    case 'подтверждена':
      return 'bg-emerald-500/15 text-emerald-100 ring-emerald-500/40'
    case 'ожидает':
      return 'bg-amber-500/15 text-amber-100 ring-amber-500/40'
    case 'выполнена':
      return 'bg-sky-500/15 text-sky-100 ring-sky-500/40'
    case 'отменена':
      return 'bg-red-500/15 text-red-100 ring-red-500/40'
    default:
      return 'bg-slate-500/15 text-slate-100 ring-slate-500/40'
  }
}

const canCancel = (appointment) =>
  appointment.status !== 'отменена' && appointment.status !== 'выполнена'

const cancelAppointment = (appointment) => {
  const ok = store.cancelOwnAppointment(appointment.id)

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: ok ? 'success' : 'error',
        message: ok ? 'Бронирование отменено.' : 'Не удалось отменить эту запись.',
      },
    })
  )
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-5 py-2 sm:py-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Личный кабинет
        </p>
        <h1 class="mt-1 text-xl font-semibold text-slate-50">
          Мои бронирования
        </h1>
        <p class="mt-1 text-sm text-slate-400">
          {{ store.currentUser?.name }}, здесь собраны ваши записи в автосервис.
        </p>
      </div>
      <RouterLink to="/" class="am-btn-primary">
        Новая запись
      </RouterLink>
    </header>

    <section
      v-if="store.userAppointments.length === 0"
      class="am-section flex flex-col items-center gap-3 py-10 text-center"
    >
      <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-700/70">
        <CalendarDaysIcon class="h-6 w-6 text-indigo-300" />
      </div>
      <div>
        <h2 class="text-base font-semibold text-slate-50">
          У вас пока нет бронирований
        </h2>
        <p class="mt-1 text-sm text-slate-400">
          Выберите услугу на главной странице и отправьте заявку.
        </p>
      </div>
      <RouterLink to="/" class="am-btn-secondary">
        Перейти к услугам
      </RouterLink>
    </section>

    <section v-else class="grid gap-4 lg:grid-cols-2">
      <article
        v-for="appointment in store.userAppointments"
        :key="appointment.id"
        class="am-card space-y-4 p-4"
      >
        <header class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <WrenchScrewdriverIcon class="h-3.5 w-3.5" />
              Услуга
            </p>
            <h2 class="mt-1 line-clamp-2 text-base font-semibold text-slate-50">
              {{ servicesMap.get(appointment.serviceId)?.name ?? 'Услуга удалена' }}
            </h2>
          </div>
          <span
            class="am-badge shrink-0 ring-1"
            :class="statusClass(appointment.status)"
          >
            {{ appointment.status }}
          </span>
        </header>

        <div class="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
          <div class="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <p class="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-slate-500">
              <CalendarDaysIcon class="h-3.5 w-3.5" />
              Дата
            </p>
            <p class="mt-1 font-medium text-slate-100">
              {{ new Date(appointment.date).toLocaleDateString('ru-RU') }}
            </p>
          </div>
          <div class="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800">
            <p class="flex items-center gap-1.5 text-xs uppercase tracking-[0.12em] text-slate-500">
              <ClockIcon class="h-3.5 w-3.5" />
              Время
            </p>
            <p class="mt-1 font-medium text-slate-100">
              {{ appointment.time }}
            </p>
          </div>
        </div>

        <div class="space-y-1 text-sm">
          <p class="text-slate-300">
            Автомобиль: <span class="text-slate-100">{{ appointment.clientCar }}</span>
          </p>
          <p class="text-slate-300">
            Телефон: <span class="text-slate-100">{{ appointment.clientPhone }}</span>
          </p>
          <p v-if="appointment.notes" class="text-slate-400">
            Комментарий: {{ appointment.notes }}
          </p>
        </div>

        <footer class="flex justify-end border-t border-slate-800/80 pt-3">
          <button
            type="button"
            class="am-btn-secondary"
            :disabled="!canCancel(appointment)"
            :class="{ 'cursor-not-allowed opacity-50': !canCancel(appointment) }"
            @click="cancelAppointment(appointment)"
          >
            <NoSymbolIcon class="h-4 w-4" />
            Отменить бронирование
          </button>
        </footer>
      </article>
    </section>
  </div>
</template>
