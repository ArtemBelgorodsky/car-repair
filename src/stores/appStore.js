// Глобальное хранилище приложения автосервиса "АвтоМастер"
// Управляет услугами, записями и авторизацией администратора

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { services as initialServices, appointments as initialAppointments } from '../mocks/data'

const STORAGE_KEY = 'automaster-app-state'

const readSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAppStore = defineStore('app', () => {
  const savedState = readSavedState()

  // Авторизация админа (простая имитация без бэкенда)
  const isAdminLogged = ref(Boolean(savedState?.isAdminLogged))
  const users = ref(savedState?.users ?? [])
  const currentUserId = ref(savedState?.currentUserId ?? null)

  // Справочник услуг и список записей
  const services = ref(savedState?.services ?? [...initialServices])
  const appointments = ref(savedState?.appointments ?? [...initialAppointments])

  const currentUser = computed(() =>
    users.value.find((user) => user.id === currentUserId.value) ?? null
  )

  const userAppointments = computed(() =>
    appointments.value
      .filter((appointment) => appointment.userId === currentUserId.value)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
  )

  watch(
    [services, appointments, users, currentUserId, isAdminLogged],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          services: services.value,
          appointments: appointments.value,
          users: users.value,
          currentUserId: currentUserId.value,
          isAdminLogged: isAdminLogged.value,
        })
      )
    },
    { deep: true }
  )

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
      userId: appointment.userId ?? currentUserId.value,
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

  const registerUser = ({ name, phone, car, email, password }) => {
    const normalizedEmail = email.trim().toLowerCase()
    const exists = users.value.some((user) => user.email === normalizedEmail)

    if (exists) {
      return {
        ok: false,
        message: 'Пользователь с такой почтой уже зарегистрирован.',
      }
    }

    const user = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      car: car.trim(),
      email: normalizedEmail,
      password,
    }

    users.value.push(user)
    currentUserId.value = user.id

    return {
      ok: true,
      user,
    }
  }

  const loginUser = (email, password) => {
    const normalizedEmail = email.trim().toLowerCase()
    const user = users.value.find(
      (item) => item.email === normalizedEmail && item.password === password
    )

    if (!user) {
      return false
    }

    currentUserId.value = user.id
    return true
  }

  const logoutUser = () => {
    currentUserId.value = null
  }

  const cancelOwnAppointment = (id) => {
    const appointment = appointments.value.find(
      (item) => item.id === id && item.userId === currentUserId.value
    )

    if (!appointment || appointment.status === 'выполнена') {
      return false
    }

    updateAppointment(id, { status: 'отменена' })
    return true
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
    users,
    currentUserId,
    currentUser,
    userAppointments,
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
    registerUser,
    loginUser,
    logoutUser,
    cancelOwnAppointment,
    loginAdmin,
    logoutAdmin,
  }
})
