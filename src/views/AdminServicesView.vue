<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStore'
import ServicesTable from '../components/admin/ServicesTable.vue'
import ServiceForm from '../components/admin/ServiceForm.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const store = useAppStore()

const isFormOpen = ref(false)
const editingService = ref(null)

const openCreate = () => {
  editingService.value = null
  isFormOpen.value = true
}

const openEdit = (service) => {
  editingService.value = service
  isFormOpen.value = true
}

const closeForm = () => {
  isFormOpen.value = false
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-4">
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-base font-semibold text-slate-50">
          Услуги автосервиса
        </h1>
        <p class="text-xs text-slate-400">
          Добавляйте, редактируйте и архивируйте услуги, которые доступны клиентам.
        </p>
      </div>

      <button
        type="button"
        class="am-btn-primary"
        @click="openCreate"
      >
        <PlusIcon class="h-4 w-4" />
        <span>Добавить услугу</span>
      </button>
    </header>

    <ServicesTable
      :services="store.services"
      @edit="openEdit"
    />

    <ServiceForm
      v-if="isFormOpen"
      :service="editingService"
      @close="closeForm"
    />
  </div>
</template>

