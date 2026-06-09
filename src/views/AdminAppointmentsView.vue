<script setup>
import { computed, ref } from 'vue'
import { useAppStore } from '../stores/appStore'
import AdminSchedule from '../components/admin/AdminSchedule.vue'
import AppointmentsList from '../components/admin/AppointmentsList.vue'
import AppointmentDetailModal from '../components/admin/AppointmentDetailModal.vue'
import {
  CalendarDaysIcon,
  ListBulletIcon,
  Squares2X2Icon,
} from '@heroicons/vue/24/outline'

const store = useAppStore()

const today = new Date().toISOString().slice(0, 10)

const selectedDate = ref(today)
const selectedServiceId = ref('all')
const selectedStatus = ref('all')
const selectedEmployeeId = ref('all')
const viewMode = ref('schedule')

const selectedAppointment = ref(null)

const visibleServices = computed(() =>
  selectedServiceId.value === 'all'
    ? store.services
    : store.services.filter((s) => s.id === selectedServiceId.value)
)

const filteredAppointments = computed(() =>
  store.appointments.filter((a) => {
    if (a.date !== selectedDate.value) return false
    if (selectedServiceId.value !== 'all' && a.serviceId !== selectedServiceId.value) return false
    if (selectedEmployeeId.value !== 'all' && a.employeeId !== selectedEmployeeId.value) return false
    if (selectedStatus.value !== 'all' && a.status !== selectedStatus.value) return false
    return true
  })
)

const handleSelectAppointment = (appointment) => {
  selectedAppointment.value = appointment
}

const closeDetails = () => {
  selectedAppointment.value = null
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div
          class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-700/70"
        >
          <CalendarDaysIcon class="h-4 w-4 text-emerald-300" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-slate-50">
            Записи клиентов
          </h1>
          <p class="text-xs text-slate-400">
            Наглядный график загрузки сервиса и список всех записей.
          </p>
        </div>
      </div>

      <div class="flex items-center gap-1 rounded-full bg-slate-900/80 p-0.5 text-xs">
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
          :class="
            viewMode === 'schedule'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:text-slate-100'
          "
          @click="viewMode = 'schedule'"
        >
          <Squares2X2Icon class="h-3.5 w-3.5" />
          График
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
          :class="
            viewMode === 'list'
              ? 'bg-slate-800 text-slate-50'
              : 'text-slate-400 hover:text-slate-100'
          "
          @click="viewMode = 'list'"
        >
          <ListBulletIcon class="h-3.5 w-3.5" />
          Список
        </button>
      </div>
    </header>

    <section class="am-section space-y-3">
      <div class="grid gap-3 text-xs sm:grid-cols-5">
        <div>
          <label class="am-label" for="dateFilter">Дата</label>
          <input
            id="dateFilter"
            v-model="selectedDate"
            type="date"
            class="am-input"
          >
        </div>

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
          <label class="am-label" for="statusFilter">Статус</label>
          <select
            id="statusFilter"
            v-model="selectedStatus"
            class="am-input"
          >
            <option value="all">
              Все статусы
            </option>
            <option value="подтверждена">
              Подтверждена
            </option>
            <option value="ожидает">
              Ожидает
            </option>
            <option value="выполнена">
              Выполнена
            </option>
            <option value="отменена">
              Отменена
            </option>
          </select>
        </div>

        <div>
          <label class="am-label" for="employeeFilter">Мастер</label>
          <select
            id="employeeFilter"
            v-model="selectedEmployeeId"
            class="am-input"
          >
            <option value="all">
              Все мастера
            </option>
            <option
              v-for="employee in store.employees"
              :key="employee.id"
              :value="employee.id"
            >
              {{ employee.name }}
            </option>
          </select>
        </div>

        <div class="flex items-end justify-end text-xs text-slate-400">
          <p>
            Найдено записей:
            <span class="font-semibold text-slate-100">{{ filteredAppointments.length }}</span>
          </p>
        </div>
      </div>
    </section>

    <AdminSchedule
      v-if="viewMode === 'schedule'"
      :services="visibleServices"
      :appointments="filteredAppointments"
      :date="selectedDate"
      @select="handleSelectAppointment"
    />

    <AppointmentsList
      v-else
      :services="store.services"
      :appointments="filteredAppointments"
      @select="handleSelectAppointment"
    />

    <AppointmentDetailModal
      v-if="selectedAppointment"
      v-model="selectedAppointment"
      :appointment="selectedAppointment"
      :service="store.services.find((s) => s.id === selectedAppointment.serviceId)"
      @close="closeDetails"
    />
  </div>
</template>

