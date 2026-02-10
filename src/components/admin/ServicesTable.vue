<script setup>
import { useAppStore } from '../../stores/appStore'
import { PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  services: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['edit'])

const store = useAppStore()

const handleDelete = (service) => {
  const confirmed = window.confirm(`Удалить услугу «${service.name}»? Связанные записи также будут удалены.`)
  if (!confirmed) return

  store.removeService(service.id)

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'info',
        message: `Услуга «${service.name}» удалена.`,
      },
    })
  )
}
</script>

<template>
  <section class="am-section">
    <div class="mb-3 flex items-center justify-between text-xs text-slate-400">
      <p>
        Всего услуг: <span class="font-semibold text-slate-100">{{ services.length }}</span>
      </p>
    </div>

    <div class="-mx-3 -my-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
      <table class="min-w-full divide-y divide-slate-800 text-sm">
        <thead class="bg-slate-900/70 text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th class="px-3 py-2 text-left">
              Название
            </th>
            <th class="px-3 py-2 text-left">
              Категория
            </th>
            <th class="px-3 py-2 text-left">
              Длительность
            </th>
            <th class="px-3 py-2 text-left">
              Стоимость
            </th>
            <th class="px-3 py-2 text-left">
              Цвет
            </th>
            <th class="px-3 py-2 text-right">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/80 text-xs">
          <tr
            v-for="service in props.services"
            :key="service.id"
            class="hover:bg-slate-900/60"
          >
            <td class="max-w-xs px-3 py-2 align-top font-medium text-slate-100">
              <div class="line-clamp-2">
                {{ service.name }}
              </div>
              <p class="mt-0.5 line-clamp-2 text-[11px] text-slate-400">
                {{ service.description }}
              </p>
            </td>
            <td class="px-3 py-2 align-top text-slate-200">
              {{ service.category }}
            </td>
            <td class="px-3 py-2 align-top text-slate-200">
              {{ service.duration }} ч
            </td>
            <td class="px-3 py-2 align-top text-emerald-300">
              {{ service.price.toLocaleString('ru-RU') }} ₽
            </td>
            <td class="px-3 py-2 align-top">
              <span
                class="inline-flex items-center gap-1 text-[11px] text-slate-300"
              >
                <span
                  class="inline-block h-3 w-3 rounded-full border border-slate-700"
                  :style="{ backgroundColor: service.color }"
                />
                <span>{{ service.color }}</span>
              </span>
            </td>
            <td class="px-3 py-2 align-top text-right">
              <div class="inline-flex gap-1">
                <button
                  type="button"
                  class="am-btn-secondary px-2 py-1 text-[11px]"
                  @click="emit('edit', service)"
                >
                  <PencilSquareIcon class="h-3.5 w-3.5" />
                  <span>Редактировать</span>
                </button>
                <button
                  type="button"
                  class="am-btn-secondary px-2 py-1 text-[11px] text-red-300 hover:text-red-100"
                  @click="handleDelete(service)"
                >
                  <TrashIcon class="h-3.5 w-3.5" />
                  <span>Удалить</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

