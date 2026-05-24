<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useAppStore } from '../stores/appStore'
import { ArrowRightOnRectangleIcon, UserPlusIcon } from '@heroicons/vue/24/outline'

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const mode = ref('login')
const errorMessage = ref('')

const isRegister = computed(() => mode.value === 'register')

const loginSchema = yup.object({
  email: yup.string().required('Введите почту').email('Введите корректную почту'),
  password: yup.string().required('Введите пароль'),
})

const registerSchema = yup.object({
  name: yup.string().required('Введите имя'),
  phone: yup.string().required('Введите телефон'),
  car: yup.string().required('Укажите автомобиль'),
  email: yup.string().required('Введите почту').email('Введите корректную почту'),
  password: yup.string().required('Введите пароль').min(6, 'Минимум 6 символов'),
})

const goAfterAuth = () => {
  router.push(route.query.redirect?.toString() || { name: 'user-appointments' })
}

const submitLogin = (values) => {
  errorMessage.value = ''
  const ok = store.loginUser(values.email, values.password)

  if (!ok) {
    errorMessage.value = 'Почта или пароль указаны неверно.'
    return
  }

  goAfterAuth()
}

const submitRegister = (values) => {
  errorMessage.value = ''
  const result = store.registerUser(values)

  if (!result.ok) {
    errorMessage.value = result.message
    return
  }

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'success',
        message: 'Аккаунт создан. Теперь ваши записи будут доступны в личном кабинете.',
      },
    })
  )

  goAfterAuth()
}

const formatPhone = (event, field) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 11)

  let formatted = '+7 '
  if (digits.length > 1) {
    formatted += '(' + digits.slice(1, 4)
    if (digits.length >= 4) formatted += ') '
  }
  if (digits.length >= 4) {
    formatted += digits.slice(4, 7)
  }
  if (digits.length >= 7) {
    formatted += '-' + digits.slice(7, 9)
  }
  if (digits.length >= 9) {
    formatted += '-' + digits.slice(9, 11)
  }

  field.value = formatted
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-2xl flex-1 items-start justify-center py-8">
    <section class="am-section w-full space-y-5">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Личный кабинет
        </p>
        <h1 class="text-xl font-semibold text-slate-50">
          {{ isRegister ? 'Регистрация клиента' : 'Вход для клиента' }}
        </h1>
        <p class="text-sm text-slate-400">
          Создайте аккаунт, чтобы видеть свои бронирования и отменять запись при необходимости.
        </p>
      </header>

      <div class="grid grid-cols-2 gap-2 rounded-lg bg-slate-900/80 p-1 text-sm">
        <button
          type="button"
          class="rounded-md px-3 py-2"
          :class="!isRegister ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:text-slate-100'"
          @click="mode = 'login'; errorMessage = ''"
        >
          Вход
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-2"
          :class="isRegister ? 'bg-slate-800 text-slate-50' : 'text-slate-400 hover:text-slate-100'"
          @click="mode = 'register'; errorMessage = ''"
        >
          Регистрация
        </button>
      </div>

      <p
        v-if="errorMessage"
        class="rounded-lg border border-red-500/50 bg-red-950/50 px-3 py-2 text-sm text-red-100"
      >
        {{ errorMessage }}
      </p>

      <Form
        v-if="!isRegister"
        class="space-y-4"
        :validation-schema="loginSchema"
        @submit="submitLogin"
      >
        <div>
          <label class="am-label" for="loginEmail">Почта</label>
          <Field
            id="loginEmail"
            name="email"
            type="email"
            class="am-input"
            placeholder="client@example.com"
          />
          <ErrorMessage name="email" class="mt-1 block text-xs text-red-400" />
        </div>

        <div>
          <label class="am-label" for="loginPassword">Пароль</label>
          <Field
            id="loginPassword"
            name="password"
            type="password"
            class="am-input"
            placeholder="Введите пароль"
          />
          <ErrorMessage name="password" class="mt-1 block text-xs text-red-400" />
        </div>

        <button type="submit" class="am-btn-primary w-full">
          <ArrowRightOnRectangleIcon class="h-4 w-4" />
          Войти
        </button>
      </Form>

      <Form
        v-else
        class="grid gap-4 sm:grid-cols-2"
        :validation-schema="registerSchema"
        @submit="submitRegister"
      >
        <div>
          <label class="am-label" for="name">Имя</label>
          <Field
            id="name"
            name="name"
            class="am-input"
            placeholder="Иван Петров"
          />
          <ErrorMessage name="name" class="mt-1 block text-xs text-red-400" />
        </div>

        <div>
          <label class="am-label" for="phone">Телефон</label>
          <Field v-slot="{ field }" name="phone">
            <input
              id="phone"
              v-bind="field"
              class="am-input"
              type="tel"
              placeholder="+7 (900) 000-00-00"
              @input="(event) => formatPhone(event, field)"
            >
          </Field>
          <ErrorMessage name="phone" class="mt-1 block text-xs text-red-400" />
        </div>

        <div class="sm:col-span-2">
          <label class="am-label" for="car">Автомобиль</label>
          <Field
            id="car"
            name="car"
            class="am-input"
            placeholder="Toyota Camry 2020"
          />
          <ErrorMessage name="car" class="mt-1 block text-xs text-red-400" />
        </div>

        <div>
          <label class="am-label" for="email">Почта</label>
          <Field
            id="email"
            name="email"
            type="email"
            class="am-input"
            placeholder="client@example.com"
          />
          <ErrorMessage name="email" class="mt-1 block text-xs text-red-400" />
        </div>

        <div>
          <label class="am-label" for="password">Пароль</label>
          <Field
            id="password"
            name="password"
            type="password"
            class="am-input"
            placeholder="Минимум 6 символов"
          />
          <ErrorMessage name="password" class="mt-1 block text-xs text-red-400" />
        </div>

        <button type="submit" class="am-btn-primary w-full sm:col-span-2">
          <UserPlusIcon class="h-4 w-4" />
          Создать аккаунт
        </button>
      </Form>
    </section>
  </div>
</template>
