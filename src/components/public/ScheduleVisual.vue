<script setup>
import { computed } from 'vue'
import { useAppStore } from '../../stores/appStore'

const props = defineProps({
  serviceId: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  durationHours: {
    type: Number,
    default: 1,
  },
})

const store = useAppStore()

const workdayStart = 9
const workdayEnd = 19
const stepMinutes = 30

const timeSlots = computed(() => {
  const result = []
  for (let hour = workdayStart; hour < workdayEnd; hour++) {
    for (let minute = 0; minute < 60; minute += stepMinutes) {
      const h = hour.toString().padStart(2, '0')
      const m = minute.toString().padStart(2, '0')
      result.push(`${h}:${m}`)
    }
  }
  return result
})

const isSlotBusy = (time) =>
  store.isAppointmentSlotBusy(props.serviceId, props.date, time, props.durationHours)
</script>

<template>
  <section class="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
    <header class="mb-3 flex items-center justify-between text-xs text-slate-300">
      <h3 class="font-semibold text-slate-100">
        Занятость на выбранный день
      </h3>
      <p class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Свободно</span>
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-slate-500" />
          <span>Занято</span>
        </span>
      </p>
    </header>

    <div class="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4 sm:text-xs">
      <div
        v-for="time in timeSlots"
        :key="time"
        class="flex items-center justify-between rounded-lg border px-2 py-1"
        :class="
          isSlotBusy(time)
            ? 'border-slate-700 bg-slate-800/80 text-slate-400'
            : 'border-emerald-700/40 bg-emerald-500/10 text-emerald-100'
        "
      >
        <span class="font-mono">{{ time }}</span>
        <span class="ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          {{ isSlotBusy(time) ? 'Занято' : 'Свободно' }}
        </span>
      </div>
    </div>
  </section>
</template>

