<script setup>
import { computed, reactive, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null,
  },
  appointment: {
    type: Object,
    required: true,
  },
  service: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'update:modelValue'])

const store = useAppStore()

const editable = reactive({
  date: props.appointment.date,
  time: props.appointment.time,
  status: props.appointment.status,
  notes: props.appointment.notes,
})

watch(
  () => props.appointment,
  (value) => {
    if (!value) return
    editable.date = value.date
    editable.time = value.time
    editable.status = value.status
    editable.notes = value.notes
  }
)

const statusOptions = [
  'подтверждена',
  'ожидает',
  'выполнена',
  'отменена',
]

const statusBadgeClass = computed(() => {
  switch (editable.status) {
    case 'подтверждена':
      return 'bg-emerald-500/15 text-emerald-200 ring-emerald-500/40'
    case 'ожидает':
      return 'bg-amber-500/15 text-amber-100 ring-amber-500/40'
    case 'выполнена':
      return 'bg-sky-500/15 text-sky-100 ring-sky-500/40'
    case 'отменена':
      return 'bg-red-500/15 text-red-100 ring-red-500/40'
    default:
      return 'bg-slate-500/15 text-slate-100 ring-slate-500/40'
  }
})

const close = () => {
  emit('close')
}

const save = () => {
  store.updateAppointment(props.appointment.id, {
    date: editable.date,
    time: editable.time,
    status: editable.status,
    notes: editable.notes,
  })

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'success',
        message: 'Изменения по записи сохранены.',
      },
    })
  )

  emit('update:modelValue', null)
  emit('close')
}
</script>

<template>
  <teleport to="body">
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div class="am-card w-full max-w-xl overflow-hidden border border-slate-700 bg-slate-950/95">
        <header class="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Детали записи
            </p>
            <h2 class="mt-1 text-sm font-semibold text-slate-50">
              {{ appointment.clientName }} · {{ appointment.clientCar }}
            </h2>
            <p class="mt-0.5 text-[11px] text-slate-400">
              Услуга: <span class="text-slate-100">{{ service.name }}</span>
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            @click="close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </header>

        <div class="grid gap-3 p-5 text-xs sm:grid-cols-2">
          <div class="space-y-2">
            <div>
              <p class="am-label">
                Дата и время
              </p>
              <div class="flex gap-2">
                <input
                  v-model="editable.date"
                  type="date"
                  class="am-input"
                >
                <input
                  v-model="editable.time"
                  type="time"
                  step="1800"
                  class="am-input"
                >
              </div>
            </div>

            <div>
              <p class="am-label">
                Статус
              </p>
              <select
                v-model="editable.status"
                class="am-input"
              >
                <option
                  v-for="status in statusOptions"
                  :key="status"
                  :value="status"
                >
                  {{ status }}
                </option>
              </select>
              <span
                class="mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1"
                :class="statusBadgeClass"
              >
                {{ editable.status }}
              </span>
            </div>
          </div>

          <div class="space-y-2">
            <div>
              <p class="am-label">
                Клиент
              </p>
              <p class="text-slate-100">
                {{ appointment.clientName }}
              </p>
              <p class="text-slate-300">
                {{ appointment.clientPhone }}
              </p>
            </div>

            <div>
              <p class="am-label">
                Примечания администратора
              </p>
              <textarea
                v-model="editable.notes"
                rows="4"
                class="am-input resize-none"
                placeholder="Добавьте комментарии по записи, актуальный статус, договорённости с клиентом"
              />
            </div>
          </div>
        </div>

        <footer class="flex justify-end gap-2 border-t border-slate-800 px-5 py-3">
          <button
            type="button"
            class="am-btn-secondary"
            @click="close"
          >
            Закрыть
          </button>
          <button
            type="button"
            class="am-btn-primary min-w-[130px] justify-center"
            @click="save"
          >
            Сохранить
          </button>
        </footer>
      </div>
    </div>
  </teleport>
</template>

