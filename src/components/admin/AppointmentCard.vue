<script setup>
import { computed } from 'vue'

const props = defineProps({
  appointment: {
    type: Object,
    required: true,
  },
  service: {
    type: Object,
    required: true,
  },
})

const statusBadgeClass = computed(() => {
  switch (props.appointment.status) {
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
</script>

<template>
  <button
    type="button"
    class="w-full rounded-lg border px-2 py-1 text-left text-[11px] shadow-sm transition-colors hover:bg-slate-900/90"
    :style="{
      borderColor: service.color,
      boxShadow: `0 0 0 1px ${service.color}33`,
    }"
  >
    <div class="flex items-center justify-between gap-1">
      <p class="line-clamp-1 font-medium text-slate-100">
        {{ appointment.clientName }}
      </p>
      <span
        class="am-badge border text-[9px]"
        :class="statusBadgeClass"
      >
        {{ appointment.status }}
      </span>
    </div>
    <p class="line-clamp-1 text-[10px] text-slate-300">
      {{ appointment.clientCar }}
    </p>
    <p class="mt-0.5 text-[10px] text-slate-400">
      {{ appointment.clientPhone }}
    </p>
  </button>
</template>

