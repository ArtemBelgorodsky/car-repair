// Глобальное хранилище приложения автосервиса "АвтоМастер"
// Управляет услугами, записями и авторизацией администратора

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import {
  services as initialServices,
  appointments as initialAppointments,
  employees as initialEmployees,
  payrolls as initialPayrolls,
  reviews as initialReviews,
} from '../mocks/data'

const STORAGE_KEY = 'automaster-app-state'
const WORKDAY_END_MINUTES = 19 * 60

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const durationToMinutes = (durationHours) => Math.round(Number(durationHours || 1) * 60)

const readSavedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const mergeEmployeesWithDefaults = (savedEmployees = []) =>
  initialEmployees.map((initialEmployee) => ({
    ...initialEmployee,
    ...(savedEmployees.find((employee) => employee.id === initialEmployee.id) ?? {}),
    login: initialEmployee.login,
    password: initialEmployee.password,
  }))

export const useAppStore = defineStore('app', () => {
  const savedState = readSavedState()

  // Авторизация админа (простая имитация без бэкенда)
  const isAdminLogged = ref(Boolean(savedState?.isAdminLogged))
  const users = ref(savedState?.users ?? [])
  const currentUserId = ref(savedState?.currentUserId ?? null)
  const currentEmployeeId = ref(savedState?.currentEmployeeId ?? null)

  // Справочник услуг, список записей и отзывы клиентов
  const services = ref(savedState?.services ?? [...initialServices])
  const appointments = ref(savedState?.appointments ?? [...initialAppointments])
  const employees = ref(mergeEmployeesWithDefaults(savedState?.employees))
  const payrolls = ref(savedState?.payrolls ?? [...initialPayrolls])
  const reviews = ref(savedState?.reviews ?? [...initialReviews])
  const notifications = ref(savedState?.notifications ?? [])

  const currentUser = computed(() =>
    users.value.find((user) => user.id === currentUserId.value) ?? null
  )

  const currentEmployee = computed(() =>
    employees.value.find((employee) => employee.id === currentEmployeeId.value) ?? null
  )

  const userAppointments = computed(() =>
    appointments.value
      .filter((appointment) => appointment.userId === currentUserId.value)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
  )

  const userNotifications = computed(() =>
    notifications.value
      .filter((notification) => notification.userId === currentUserId.value)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  )

  watch(
    [services, appointments, employees, payrolls, reviews, notifications, users, currentUserId, currentEmployeeId, isAdminLogged],
    () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          services: services.value,
          appointments: appointments.value,
          employees: employees.value,
          payrolls: payrolls.value,
          reviews: reviews.value,
          notifications: notifications.value,
          users: users.value,
          currentUserId: currentUserId.value,
          currentEmployeeId: currentEmployeeId.value,
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

  const getServiceDuration = (serviceId) =>
    services.value.find((service) => service.id === serviceId)?.duration ?? 1

  const isAppointmentSlotBusy = (
    serviceId,
    date,
    time,
    durationHours = null,
    excludeAppointmentId = null
  ) => {
    const start = timeToMinutes(time)
    const end = start + durationToMinutes(durationHours ?? getServiceDuration(serviceId))

    if (end > WORKDAY_END_MINUTES) {
      return true
    }

    return appointments.value.some(
      (appointment) =>
        appointment.id !== excludeAppointmentId &&
        appointment.serviceId === serviceId &&
        appointment.date === date &&
        appointment.time === time &&
        appointment.status !== 'отменена'
    )
  }

  const addNotification = ({ userId, appointmentId, type, message }) => {
    if (!userId) return

    notifications.value.push({
      id: `ntf-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      userId,
      appointmentId,
      type,
      message,
      createdAt: new Date().toISOString(),
    })
  }

  const removeNotification = (id) => {
    notifications.value = notifications.value.filter((notification) => notification.id !== id)
  }

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
    if (isAppointmentSlotBusy(appointment.serviceId, appointment.date, appointment.time)) {
      return false
    }

    appointments.value.push({
      ...appointment,
      id: appointment.id || `app-${Date.now()}`,
      userId: appointment.userId ?? currentUserId.value,
    })

    return true
  }

  const updateAppointment = (id, patch, options = { notifyClient: true }) => {
    const index = appointments.value.findIndex((a) => a.id === id)
    if (index !== -1) {
      const previous = appointments.value[index]
      appointments.value[index] = { ...appointments.value[index], ...patch }

      if (options.notifyClient && patch.status && patch.status !== previous.status) {
        const serviceName =
          services.value.find((service) => service.id === previous.serviceId)?.name ?? 'выбранную услугу'

        if (patch.status === 'подтверждена') {
          addNotification({
            userId: previous.userId,
            appointmentId: previous.id,
            type: 'success',
            message: `Ваша запись на услугу «${serviceName}» подтверждена администратором.`,
          })
        }

        if (patch.status === 'отменена') {
          addNotification({
            userId: previous.userId,
            appointmentId: previous.id,
            type: 'error',
            message: `Ваша запись на услугу «${serviceName}» отклонена администратором.`,
          })
        }
      }
    }
  }

  const removeAppointment = (id) => {
    appointments.value = appointments.value.filter((a) => a.id !== id)
  }

  const addPayroll = ({ employeeId, amount, paidAt }) => {
    const employeeExists = employees.value.some((employee) => employee.id === employeeId)
    const normalizedAmount = Number(amount)

    if (!employeeExists || !Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return false
    }

    const nextId =
      payrolls.value.reduce((max, payroll) => Math.max(max, Number(payroll.id) || 0), 0) + 1

    payrolls.value.unshift({
      id: nextId,
      employeeId,
      amount: Number(normalizedAmount.toFixed(2)),
      paidAt: paidAt || new Date().toISOString(),
    })

    return true
  }

  const addReview = (review) => {
    if (review.appointmentId) {
      const appointment = appointments.value.find((item) => item.id === review.appointmentId)
      const alreadyReviewed = reviews.value.some((item) => item.appointmentId === review.appointmentId)

      if (
        !appointment ||
        appointment.userId !== currentUserId.value ||
        appointment.serviceId !== review.serviceId ||
        appointment.status !== 'выполнена' ||
        alreadyReviewed
      ) {
        return false
      }
    }

    reviews.value.push({
      ...review,
      id: review.id || `rev-${Date.now()}`,
      userId: review.userId ?? currentUserId.value,
      createdAt: review.createdAt || new Date().toISOString(),
    })

    return true
  }

  const registerUser = ({ name, phone, car, licensePlate, carYear, vin, email, password }) => {
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
      licensePlate: licensePlate.trim().toUpperCase(),
      carYear: Number(carYear),
      vin: vin.trim().toUpperCase(),
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

  const loginEmployee = (login, password) => {
    const normalizedLogin = login.trim().toLowerCase()
    const employee = employees.value.find(
      (item) => item.login === normalizedLogin && item.password === password
    )

    if (!employee) {
      return false
    }

    currentEmployeeId.value = employee.id
    return true
  }

  const logoutEmployee = () => {
    currentEmployeeId.value = null
  }

  const cancelOwnAppointment = (id) => {
    const appointment = appointments.value.find(
      (item) => item.id === id && item.userId === currentUserId.value
    )

    if (!appointment || appointment.status === 'выполнена') {
      return false
    }

    updateAppointment(id, { status: 'отменена' }, { notifyClient: false })
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
    currentEmployeeId,
    currentUser,
    currentEmployee,
    userAppointments,
    userNotifications,
    services,
    appointments,
    employees,
    payrolls,
    reviews,
    // вычисляемые геттеры
    getAppointmentsByServiceAndDate,
    getAppointmentsByDate,
    isAppointmentSlotBusy,
    // методы
    addService,
    updateService,
    removeService,
    addAppointment,
    updateAppointment,
    removeAppointment,
    addPayroll,
    addReview,
    removeNotification,
    registerUser,
    loginUser,
    logoutUser,
    loginEmployee,
    logoutEmployee,
    cancelOwnAppointment,
    loginAdmin,
    logoutAdmin,
  }
})
