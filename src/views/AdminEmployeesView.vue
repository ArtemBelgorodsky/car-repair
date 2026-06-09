<script setup>
import { computed, reactive } from 'vue'
import { useAppStore } from '../stores/appStore'
import {
  BanknotesIcon,
  BriefcaseIcon,
  PhoneIcon,
  UserGroupIcon,
} from '@heroicons/vue/24/outline'

const store = useAppStore()

const payrollForm = reactive({
  employeeId: store.employees[0]?.id ?? '',
  amount: '',
})

const employeesMap = computed(() => {
  const map = new Map()
  store.employees.forEach((employee) => map.set(employee.id, employee))
  return map
})

const payrollsByEmployee = computed(() => {
  const map = new Map()

  store.payrolls.forEach((payroll) => {
    const current = map.get(payroll.employeeId) ?? 0
    map.set(payroll.employeeId, current + Number(payroll.amount || 0))
  })

  return map
})

const sortedPayrolls = computed(() =>
  [...store.payrolls].sort((a, b) => b.paidAt.localeCompare(a.paidAt))
)

const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const submitPayroll = () => {
  const ok = store.addPayroll({
    employeeId: payrollForm.employeeId,
    amount: payrollForm.amount,
  })

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: ok ? 'success' : 'error',
        message: ok ? 'Выплата сотруднику назначена.' : 'Проверьте сотрудника и сумму выплаты.',
      },
    })
  )

  if (ok) {
    payrollForm.amount = ''
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-700/70">
          <UserGroupIcon class="h-4 w-4 text-emerald-300" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-slate-50">
            Мастера и зарплаты
          </h1>
          <p class="text-xs text-slate-400">
            В штате 7 мастеров. Администратор назначает выплаты сотрудникам.
          </p>
        </div>
      </div>

      <span class="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300 ring-1 ring-slate-800">
        Мастеров: {{ store.employees.length }}
      </span>
    </header>

    <section class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <article
        v-for="employee in store.employees"
        :key="employee.id"
        class="am-card flex flex-col gap-3 p-4"
      >
        <header class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-50">
              {{ employee.name }}
            </h2>
            <p class="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <BriefcaseIcon class="h-3.5 w-3.5" />
              {{ employee.position }}
            </p>
          </div>
          <span class="am-badge bg-emerald-500/15 text-emerald-100 ring-1 ring-emerald-500/40">
            {{ formatMoney(payrollsByEmployee.get(employee.id)) }}
          </span>
        </header>

        <p class="text-xs text-slate-300">
          {{ employee.specialization }}
        </p>
        <p class="mt-auto flex items-center gap-1.5 text-xs text-slate-400">
          <PhoneIcon class="h-3.5 w-3.5" />
          {{ employee.phone }}
        </p>
      </article>
    </section>

    <section class="am-section space-y-4">
      <header class="flex items-center gap-2">
        <BanknotesIcon class="h-5 w-5 text-indigo-300" />
        <div>
          <h2 class="text-sm font-semibold text-slate-50">
            Назначить выплату
          </h2>
          <p class="text-xs text-slate-400">
            Запись сохраняется как выплата сотруднику с датой и временем назначения.
          </p>
        </div>
      </header>

      <form
        class="grid gap-3 text-xs sm:grid-cols-[1fr_180px_auto]"
        @submit.prevent="submitPayroll"
      >
        <div>
          <label class="am-label" for="payrollEmployee">Сотрудник</label>
          <select
            id="payrollEmployee"
            v-model="payrollForm.employeeId"
            class="am-input"
          >
            <option
              v-for="employee in store.employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.name }} — {{ employee.position }}
            </option>
          </select>
        </div>

        <div>
          <label class="am-label" for="payrollAmount">Сумма</label>
          <input
            id="payrollAmount"
            v-model="payrollForm.amount"
            class="am-input"
            min="1"
            step="0.01"
            type="number"
            placeholder="50000"
          >
        </div>

        <div class="flex items-end">
          <button
            type="submit"
            class="am-btn-primary w-full whitespace-nowrap"
          >
            <BanknotesIcon class="h-4 w-4" />
            Назначить
          </button>
        </div>
      </form>
    </section>

    <section class="am-section space-y-3">
      <header class="flex items-center justify-between gap-3 text-xs">
        <h2 class="font-semibold text-slate-100">
          История выплат
        </h2>
        <p class="text-slate-400">
          payrolls: id, employee_id, amount, paid_at
        </p>
      </header>

      <div class="-mx-3 -my-2 overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
        <table class="min-w-full divide-y divide-slate-800 text-xs">
          <thead class="bg-slate-900/70 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th class="px-3 py-2 text-left">
                ID
              </th>
              <th class="px-3 py-2 text-left">
                employee_id
              </th>
              <th class="px-3 py-2 text-left">
                Сотрудник
              </th>
              <th class="px-3 py-2 text-left">
                amount
              </th>
              <th class="px-3 py-2 text-left">
                paid_at
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80">
            <tr
              v-for="payroll in sortedPayrolls"
              :key="payroll.id"
              class="hover:bg-slate-900/60"
            >
              <td class="px-3 py-2 font-mono text-slate-300">
                {{ payroll.id }}
              </td>
              <td class="px-3 py-2 font-mono text-slate-300">
                {{ payroll.employeeId }}
              </td>
              <td class="px-3 py-2 text-slate-100">
                {{ employeesMap.get(payroll.employeeId)?.name ?? '—' }}
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
