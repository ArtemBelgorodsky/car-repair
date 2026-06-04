<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  BanknotesIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  service: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['book'])

const categoryBadgeClass = computed(() => {
  switch (props.service.category) {
    case 'Техническое обслуживание':
      return 'bg-indigo-500/20 text-indigo-200 ring-indigo-500/40'
    case 'Кузовной ремонт':
      return 'bg-amber-500/20 text-amber-100 ring-amber-500/40'
    case 'Диагностика':
      return 'bg-emerald-500/20 text-emerald-100 ring-emerald-500/40'
    default:
      return 'bg-slate-500/20 text-slate-100 ring-slate-500/40'
  }
})
</script>

<template>
  <article
    class="am-card am-card-hover flex h-full flex-col overflow-hidden"
  >
    <div class="relative border-b border-slate-800/70 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 px-4 py-3">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(129,140,248,0.32),transparent_60%)] opacity-50"
      />
      <div class="relative flex items-start justify-between gap-3">
        <div class="flex flex-col">
          <div class="mb-1 inline-flex items-center gap-1.5">
            <span
              class="am-badge border text-[10px] font-semibold uppercase"
              :class="categoryBadgeClass"
            >
              <WrenchScrewdriverIcon class="mr-1 h-3 w-3" />
              {{ service.category }}
            </span>
          </div>
          <h3 class="text-base font-semibold tracking-tight text-slate-50">
            {{ service.name }}
          </h3>
        </div>

        <div
          class="mt-1 h-9 w-9 flex-none rounded-xl border border-slate-700/60 bg-slate-900/60"
          :style="{ boxShadow: `0 0 0 1px ${service.color}33` }"
        >
          <div
            class="flex h-full w-full items-center justify-center rounded-xl text-xs font-semibold text-slate-100"
            :style="{ background: `linear-gradient(135deg, ${service.color}33, transparent)` }"
          >
            <ClockIcon class="h-4 w-4" />
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col justify-between gap-4 p-4 text-sm text-slate-200">
      <p class="line-clamp-3 text-xs leading-relaxed text-slate-300">
        {{ service.description }}
      </p>

      <dl class="mt-1 space-y-1.5 text-xs text-slate-300">
        <div class="flex items-center justify-between gap-2">
          <dt class="inline-flex items-center gap-1 text-slate-400">
            <ClockIcon class="h-3.5 w-3.5" />
            <span>Длительность</span>
          </dt>
          <dd class="font-medium text-slate-100">
            {{ service.duration }} ч
          </dd>
        </div>
        <div class="flex items-center justify-between gap-2">
          <dt class="inline-flex items-center gap-1 text-slate-400">
            <BanknotesIcon class="h-3.5 w-3.5" />
            <span>Стоимость</span>
          </dt>
          <dd class="font-semibold text-emerald-300">
            {{ service.price.toLocaleString('ru-RU') }} ₽
          </dd>
        </div>
      </dl>

      <div class="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          class="am-btn-primary justify-center text-sm"
          @click="emit('book', service)"
        >
          Записаться
        </button>
        <RouterLink
          :to="{ name: 'service-reviews', params: { serviceId: service.id } }"
          class="am-btn-secondary justify-center text-sm"
        >
          <ChatBubbleLeftRightIcon class="h-4 w-4" />
          Отзывы
        </RouterLink>
      </div>
    </div>
  </article>
</template>

