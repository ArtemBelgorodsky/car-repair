// Глобальное хранилище приложения автосервиса "АвтоМастер"
// Управляет услугами, записями и авторизацией администратора

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { services as initialServices, appointments as initialAppointments } from '../mocks/data'

export const useAppStore = defineStore('app', () => {
  // Авторизация админа (простая имитация без бэкенда)
  const isAdminLogged = ref(false)

  // Справочник услуг и список записей
  const services = ref([...initialServices])
  const appointments = ref([...initialAppointments])

  // Фильтрация записей по услуге и дате
  const getAppointmentsByServiceAndDate = (serviceId, date) =>
    computed(() => appointments.value.filter((a) => a.serviceId === serviceId && a.date === date))

  const getAppointmentsByDate = (date) =>
    computed(() => appointments.value.filter((a) => a.date === date))

  // CRUD для услуг
  const addService = (service) => {
    services.value.push({
      ...service,
      id: service.id || `srv-${Date.now()}`,
    })
  }

  const updateService = (id, patch) => {
    const index = services.value.findIndex((s) => s.id === id)
    if (index !== -1) {
      services.value[index] = { ...services.value[index], ...patch }
    }
  }

  const removeService = (id) => {
    services.value = services.value.filter((s) => s.id !== id)
    // При удалении услуги можно также удалить связанные записи
    appointments.value = appointments.value.filter((a) => a.serviceId !== id)
  }

  // CRUD для записей
  const addAppointment = (appointment) => {
    appointments.value.push({
      ...appointment,
      id: appointment.id || `app-${Date.now()}`,
    })
  }

  const updateAppointment = (id, patch) => {
    const index = appointments.value.findIndex((a) => a.id === id)
    if (index !== -1) {
      appointments.value[index] = { ...appointments.value[index], ...patch }
    }
  }

  const removeAppointment = (id) => {
    appointments.value = appointments.value.filter((a) => a.id !== id)
  }

  // Авторизация / выход
  const loginAdmin = (login, password) => {
    // Примитивная проверка, как указано в ТЗ
    if (login === 'admin' && password === 'admin123') {
      isAdminLogged.value = true
      return true
    }
    return false
  }

  const logoutAdmin = () => {
    isAdminLogged.value = false
  }

  return {
    // состояние
    isAdminLogged,
    services,
    appointments,
    // вычисляемые геттеры
    getAppointmentsByServiceAndDate,
    getAppointmentsByDate,
    // методы
    addService,
    updateService,
    removeService,
    addAppointment,
    updateAppointment,
    removeAppointment,
    loginAdmin,
    logoutAdmin,
  }
})

