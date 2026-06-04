<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/appStore'
import {
  ChatBubbleLeftRightIcon,
  FunnelIcon,
  StarIcon,
} from '@heroicons/vue/24/outline'

const store = useAppStore()

const selectedRating = ref('all')
const selectedServiceId = ref('all')

const servicesMap = computed(() => {
  const map = new Map()
  store.services.forEach((service) => map.set(service.id, service))
  return map
})

const sortedReviews = computed(() =>
  [...store.reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
)

const filteredReviews = computed(() =>
  sortedReviews.value.filter((review) => {
    if (selectedRating.value === 'all') return true
    return review.rating === Number(selectedRating.value)
  }).filter((review) => {
    if (selectedServiceId.value === 'all') return true
    return review.serviceId === selectedServiceId.value
  })
)

const averageRating = computed(() => {
  if (store.reviews.length === 0) return '0.0'
  const total = store.reviews.reduce((sum, review) => sum + Number(review.rating), 0)
  return (total / store.reviews.length).toFixed(1)
})
</script>

<template>
  <div class="flex flex-1 flex-col gap-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-700/70"
        >
          <ChatBubbleLeftRightIcon class="h-4 w-4 text-indigo-300" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-slate-50">
            Отзывы клиентов
          </h1>
          <p class="text-xs text-slate-400">
            Просмотр оценок, комментариев, даты и времени отправки.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="rounded-lg bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Средняя оценка
          </p>
          <p class="mt-0.5 font-semibold text-amber-200">
            {{ averageRating }} / 5
          </p>
        </div>
        <div class="rounded-lg bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800">
          <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">
            Всего
          </p>
          <p class="mt-0.5 font-semibold text-slate-100">
            {{ store.reviews.length }}
          </p>
        </div>
      </div>
    </header>

    <section class="am-section space-y-3">
      <div class="grid gap-3 text-xs sm:grid-cols-[220px_220px_1fr]">
        <div>
          <label class="am-label" for="serviceFilter">Услуга</label>
          <select
            id="serviceFilter"
            v-model="selectedServiceId"
            class="am-input"
          >
            <option value="all">
              Все услуги
            </option>
            <option
              v-for="service in store.services"
              :key="service.id"
              :value="service.id"
            >
              {{ service.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="am-label" for="ratingFilter">Оценка</label>
          <select
            id="ratingFilter"
            v-model="selectedRating"
            class="am-input"
          >
            <option value="all">
              Все оценки
            </option>
            <option
              v-for="value in [5, 4, 3, 2, 1]"
              :key="value"
              :value="String(value)"
            >
              {{ value }} из 5
            </option>
          </select>
        </div>

        <div class="flex items-end justify-end text-xs text-slate-400">
          <p class="flex items-center gap-1.5">
            <FunnelIcon class="h-4 w-4" />
            Найдено отзывов:
            <span class="font-semibold text-slate-100">{{ filteredReviews.length }}</span>
          </p>
        </div>
      </div>
    </section>

    <section class="am-section space-y-3">
      <header class="flex items-center justify-between text-xs text-slate-300">
        <h2 class="font-semibold text-slate-100">
          Список отзывов
        </h2>
        <p class="text-[11px] text-slate-400">
          Новые отзывы отображаются первыми.
        </p>
      </header>

      <div
        v-if="filteredReviews.length === 0"
        class="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-400"
      >
        Отзывы с выбранной оценкой не найдены.
      </div>

      <div
        v-else
        class="-mx-3 -my-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60"
      >
        <table class="min-w-full divide-y divide-slate-800 text-xs">
          <thead class="bg-slate-900/70 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-3 py-2 text-left">
                Дата / время
              </th>
              <th class="px-3 py-2 text-left">
                Клиент
              </th>
              <th class="px-3 py-2 text-left">
                Услуга
              </th>
              <th class="px-3 py-2 text-left">
                Оценка
              </th>
              <th class="px-3 py-2 text-left">
                Комментарий
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr
              v-for="review in filteredReviews"
              :key="review.id"
              class="hover:bg-slate-900/60"
            >
              <td class="whitespace-nowrap px-3 py-3 font-mono text-[11px] text-slate-300">
                {{ new Date(review.createdAt).toLocaleDateString('ru-RU') }}
                <span class="ml-1 text-slate-500">в</span>
                {{ new Date(review.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) }}
              </td>
              <td class="px-3 py-3 font-medium text-slate-100">
                {{ review.clientName }}
              </td>
              <td class="px-3 py-3 text-slate-300">
                {{ servicesMap.get(review.serviceId)?.name ?? '—' }}
              </td>
              <td class="px-3 py-3">
                <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-amber-100 ring-1 ring-amber-500/40">
                  <StarIcon class="h-3.5 w-3.5 fill-amber-300 stroke-amber-300" />
                  {{ review.rating }}/5
                </span>
              </td>
              <td class="max-w-xl px-3 py-3 text-slate-300">
                {{ review.comment }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
