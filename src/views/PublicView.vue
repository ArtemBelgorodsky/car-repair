<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStore'
import ServiceCard from '../components/public/ServiceCard.vue'
import AppointmentModal from '../components/public/AppointmentModal.vue'
import { ArrowRightIcon, SparklesIcon } from '@heroicons/vue/24/outline'

const store = useAppStore()

const selectedService = ref(null)
const isModalOpen = ref(false)

const openBooking = (service) => {
  selectedService.value = service
  isModalOpen.value = true
}

const closeBooking = () => {
  isModalOpen.value = false
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-6 py-2 sm:py-4">
    <section class="am-section relative overflow-hidden">
      <div
        class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.65),transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.4),transparent_55%)] opacity-60"
      />
      <div class="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div class="max-w-xl space-y-4">
          <p class="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-indigo-700">
            <SparklesIcon class="h-3.5 w-3.5" />
            Цифровой автосервис
          </p>
          <h1 class="text-2xl font-semibold leading-tight text-slate-900 sm:text-3xl text-white">
            Информационная система автосервиса
            <span class="bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              «АвтоМастер»
            </span>
          </h1>
          <p class="text-sm leading-relaxed text-slate-600 sm:text-[15px] text-white">
            Записывайтесь на обслуживание онлайн, отслеживайте статус заявки и доверяйте свой автомобиль
            профессиональной команде мастеров. Без звонков и ожиданий.
          </p>
          <div class="flex flex-wrap gap-2 text-xs text-slate-600">
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
              ⏱ Быстрая запись
            </span>
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
              📊 Наглядное расписание
            </span>
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 ring-1 ring-slate-200">
              💬 Коммуникация с администратором
            </span>
          </div>

          <div class="mt-3 flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              class="am-btn-primary group"
              @click="openBooking(store.services[0])"
            >
              Записаться сейчас
              <ArrowRightIcon class="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <p class="text-[11px] text-slate-500">
              Выберите услугу ниже, чтобы подобрать удобное время.
            </p>
          </div>
        </div>

        <div class="sm:w-[42%]">
          <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-md shadow-slate-200/80">
            <div
              class="absolute inset-0 bg-gradient-to-tr from-slate-900/5 via-transparent to-indigo-500/10"
            />
            <img
              src="https://img.freepik.com/premium-photo/mechanic-using-tools-repair-vehicle-parts-highquality-camera-lens-ar-32-job-id-06a22f1c7b6140_1293074-24884.jpg?semt=ais_hybrid&w=740"
              alt="Мастер осматривает автомобиль в современном автосервисе"
              class="h-56 w-full object-cover sm:h-64 md:h-72"
              loading="lazy"
            >
          </div>
        </div>
      </div>
    </section>

    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
          Услуги автосервиса
        </h2>
        <p class="text-xs text-slate-400">
          {{ store.services.length }} популярных услуги
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ServiceCard
          v-for="service in store.services"
          :key="service.id"
          :service="service"
          @book="openBooking"
        />
      </div>
    </section>

    <AppointmentModal
      v-if="selectedService"
      v-model="isModalOpen"
      :service="selectedService"
      @update:model-value="(value) => (isModalOpen = value)"
    />
  </div>
</template>

