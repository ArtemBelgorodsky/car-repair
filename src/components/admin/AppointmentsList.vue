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
})

const emit = defineEmits(['select'])

const servicesMap = computed(() => {
  const map = new Map()
  props.services.forEach((s) => map.set(s.id, s))
  return map
})

const sortedAppointments = computed(() =>
  [...props.appointments].sort((a, b) => {
    const ad = `${a.date} ${a.time}`
    const bd = `${b.date} ${b.time}`
    return ad.localeCompare(bd)
  })
)
</script>

<template>
  <section class="am-section space-y-3">
    <header class="flex items-center justify-between text-xs text-slate-300">
      <h2 class="font-semibold text-slate-100">
        Список записей
      </h2>
      <p class="text-[11px] text-slate-400">
        Отсортированы по дате и времени.
      </p>
    </header>

    <div class="-mx-3 -my-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
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
              Автомобиль
            </th>
            <th class="px-3 py-2 text-left">
              Телефон
            </th>
            <th class="px-3 py-2 text-left">
              Статус
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800/80">
          <tr
            v-for="appointment in sortedAppointments"
            :key="appointment.id"
            class="hover:bg-slate-900/60"
            @click="emit('select', appointment)"
          >
            <td class="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-slate-300">
              {{ new Date(appointment.date).toLocaleDateString('ru-RU') }}
              <span class="ml-1 text-slate-500">в</span>
              {{ appointment.time }}
            </td>
            <td class="px-3 py-2 text-slate-100">
              {{ appointment.clientName }}
            </td>
            <td class="px-3 py-2 text-slate-200">
              {{ servicesMap.get(appointment.serviceId)?.name ?? '—' }}
            </td>
            <td class="px-3 py-2 text-slate-300">
              {{ appointment.clientCar }}
            </td>
            <td class="px-3 py-2 text-slate-300">
              {{ appointment.clientPhone }}
            </td>
            <td class="px-3 py-2 text-slate-200">
              <AppointmentCard
                :appointment="appointment"
                :service="servicesMap.get(appointment.serviceId)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

