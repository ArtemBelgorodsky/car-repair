<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import {
  BanknotesIcon,
  CalendarDaysIcon,
  ClockIcon,
  PowerIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/vue/24/outline'

const store = useAppStore()
const router = useRouter()

const selectedEmployee = computed(() => store.currentEmployee)

const servicesMap = computed(() => {
  const map = new Map()
  store.services.forEach((service) => map.set(service.id, service))
  return map
})

const assignedAppointments = computed(() =>
  store.appointments
    .filter((appointment) => appointment.employeeId === store.currentEmployeeId)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
)

const employeePayrolls = computed(() =>
  store.payrolls
    .filter((payroll) => payroll.employeeId === store.currentEmployeeId)
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt))
)

const totalPayroll = computed(() =>
  employeePayrolls.value.reduce((sum, payroll) => sum + Number(payroll.amount || 0), 0)
)

const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const statusOptions = [
  'подтверждена',
  'ожидает',
  'выполнена',
  'отменена',
]

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

const logout = () => {
  store.logoutEmployee()
  router.push({ name: 'master-login' })
}

const updateStatus = (appointment, status) => {
  store.updateAppointment(appointment.id, { status })

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'success',
        message: 'Статус работы обновлён.',
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
          Кабинет мастера
        </p>
        <h1 class="mt-1 text-xl font-semibold text-slate-50">
          Назначенные работы и выплаты
        </h1>
      </div>

      <button
        type="button"
        class="am-btn-secondary"
        @click="logout"
      >
        <PowerIcon class="h-4 w-4" />
        Выйти
      </button>
    </header>

    <section class="grid gap-4 md:grid-cols-3">
      <article class="am-card p-4 md:col-span-2">
        <p class="text-xs uppercase tracking-[0.18em] text-slate-400">
          Сотрудник
        </p>
        <h2 class="mt-1 text-lg font-semibold text-slate-50">
          {{ selectedEmployee?.name }}
        </h2>
        <p class="mt-2 text-sm text-slate-300">
          {{ selectedEmployee?.specialization }}
        </p>
        <p class="mt-2 text-xs text-slate-400">
          {{ selectedEmployee?.phone }}
        </p>
      </article>

      <article class="am-card flex flex-col justify-between gap-3 p-4">
        <div>
          <p class="flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-slate-400">
            <BanknotesIcon class="h-4 w-4" />
            Выплаты
          </p>
          <p class="mt-2 text-2xl font-semibold text-emerald-100">
            {{ formatMoney(totalPayroll) }}
          </p>
        </div>
        <p class="text-xs text-slate-500">
          Всего выплат: {{ employeePayrolls.length }}
        </p>
      </article>
    </section>

    <section class="am-section space-y-3">
      <header class="flex items-center justify-between gap-3">
        <div>
          <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-50">
            <WrenchScrewdriverIcon class="h-4 w-4 text-indigo-300" />
            Работы мастера
          </h2>
          <p class="mt-1 text-xs text-slate-400">
            Показываются только записи, которые администратор назначил этому мастеру.
          </p>
        </div>
        <span class="rounded-full bg-slate-950/70 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-slate-800">
          {{ assignedAppointments.length }}
        </span>
      </header>

      <div
        v-if="assignedAppointments.length === 0"
        class="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-sm text-slate-400"
      >
        Назначенных работ пока нет.
      </div>

      <div
        v-else
        class="grid gap-3 lg:grid-cols-2"
      >
        <article
          v-for="appointment in assignedAppointments"
          :key="appointment.id"
          class="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
        >
          <header class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs text-slate-400">
                {{ servicesMap.get(appointment.serviceId)?.name ?? 'Услуга удалена' }}
              </p>
              <h3 class="mt-1 text-sm font-semibold text-slate-50">
                {{ appointment.clientName }} · {{ appointment.clientCar }}
              </h3>
            </div>
            <span
              class="am-badge shrink-0 ring-1"
              :class="statusClass(appointment.status)"
            >
              {{ appointment.status }}
            </span>
          </header>

          <div class="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2">
            <p class="flex items-center gap-1.5">
              <CalendarDaysIcon class="h-4 w-4 text-slate-500" />
              {{ new Date(appointment.date).toLocaleDateString('ru-RU') }}
            </p>
            <p class="flex items-center gap-1.5">
              <ClockIcon class="h-4 w-4 text-slate-500" />
              {{ appointment.time }}
            </p>
          </div>

          <div class="mt-3 space-y-1 text-xs text-slate-400">
            <p>Госномер: <span class="text-slate-200">{{ appointment.clientLicensePlate || '—' }}</span></p>
            <p>VIN: <span class="break-all text-slate-200">{{ appointment.clientVin || '—' }}</span></p>
            <p v-if="appointment.notes">
              Комментарий: {{ appointment.notes }}
            </p>
          </div>

          <div class="mt-3 border-t border-slate-800 pt-3">
            <label
              class="am-label"
              :for="`status-${appointment.id}`"
            >
              Изменить статус
            </label>
            <select
              :id="`status-${appointment.id}`"
              class="am-input"
              :value="appointment.status"
              @change="updateStatus(appointment, $event.target.value)"
            >
              <option
                v-for="status in statusOptions"
                :key="status"
                :value="status"
              >
                {{ status }}
              </option>
            </select>
          </div>
        </article>
      </div>
    </section>

    <section class="am-section space-y-3">
      <header class="flex items-center justify-between gap-3">
        <h2 class="flex items-center gap-2 text-sm font-semibold text-slate-50">
          <BanknotesIcon class="h-4 w-4 text-emerald-300" />
          Мои выплаты
        </h2>
        <span class="text-xs text-slate-400">
          {{ formatMoney(totalPayroll) }}
        </span>
      </header>

      <div
        v-if="employeePayrolls.length === 0"
        class="rounded-xl border border-slate-800 bg-slate-950/50 p-6 text-center text-sm text-slate-400"
      >
        Выплат пока нет.
      </div>

      <div
        v-else
        class="-mx-3 -my-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60"
      >
        <table class="min-w-full divide-y divide-slate-800 text-xs">
          <thead class="bg-slate-900/70 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-3 py-2 text-left">
                ID
              </th>
              <th class="px-3 py-2 text-left">
                Сумма
              </th>
              <th class="px-3 py-2 text-left">
                Дата выплаты
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr
              v-for="payroll in employeePayrolls"
              :key="payroll.id"
            >
              <td class="px-3 py-2 font-mono text-slate-300">
                {{ payroll.id }}
              </td>
              <td class="px-3 py-2 font-semibold text-emerald-100">
                {{ formatMoney(payroll.amount) }}
              </td>
              <td class="whitespace-nowrap px-3 py-2 text-slate-300">
                {{ new Date(payroll.paidAt).toLocaleString('ru-RU') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
