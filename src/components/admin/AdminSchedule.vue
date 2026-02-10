<script setup>
import { computed } from 'vue'
import AppointmentCard from './AppointmentCard.vue'

const props = defineProps({
  services: {
    type: Array,
    required: true,
  },
  appointments: {
    type: Array,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['select'])

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

const getAppointmentsForCell = (serviceId, time) =>
  props.appointments.filter((a) => a.serviceId === serviceId && a.time === time)
</script>

<template>
  <section class="am-section space-y-3">
    <header class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
      <div>
        <h2 class="font-semibold text-slate-100">
          График на {{ new Date(date).toLocaleDateString('ru-RU') }}
        </h2>
        <p class="text-[11px] text-slate-400">
          Временная сетка с шагом 30 минут по каждой услуге.
        </p>
      </div>
      <p class="text-[11px] text-slate-400">
        Время работы: 09:00 – 19:00
      </p>
    </header>

    <div class="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs">
      <table class="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th class="sticky left-0 z-10 bg-slate-950/95 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Время
            </th>
            <th
              v-for="service in services"
              :key="service.id"
              class="min-w-[160px] border-b border-l border-slate-800/90 px-2 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-300"
            >
              <div class="flex flex-col gap-0.5">
                <span class="line-clamp-1 text-slate-100">
                  {{ service.name }}
                </span>
                <span
                  class="inline-flex items-center gap-1 text-[10px] text-slate-400"
                >
                  <span
                    class="inline-block h-2 w-2 rounded-full border border-slate-700"
                    :style="{ backgroundColor: service.color }"
                  />
                  {{ service.category }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="time in timeSlots"
            :key="time"
            class="border-t border-slate-900/80 hover:bg-slate-900/40"
          >
            <td
              class="sticky left-0 z-10 whitespace-nowrap border-r border-slate-900/90 bg-slate-950/95 px-2 py-1.5 text-[11px] font-mono text-slate-300"
            >
              {{ time }}
            </td>
            <td
              v-for="service in services"
              :key="service.id + time"
              class="min-w-[160px] border-l border-slate-900/80 px-1.5 py-1 align-top"
            >
              <div class="flex flex-col gap-1">
                <AppointmentCard
                  v-for="appointment in getAppointmentsForCell(service.id, time)"
                  :key="appointment.id"
                  :appointment="appointment"
                  :service="service"
                  @click="emit('select', appointment)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

