<script setup>
import { useRouter } from 'vue-router'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useAppStore } from '../../stores/appStore'
import LoaderSpinner from '../shared/LoaderSpinner.vue'
import { LockClosedIcon, UserCircleIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const store = useAppStore()

const schema = yup.object({
  login: yup.string().required('Введите логин'),
  password: yup.string().required('Введите пароль'),
})

const handleSubmit = async (values, { setFieldError }) => {
  const ok = store.loginAdmin(values.login, values.password)
  if (!ok) {
    setFieldError('password', 'Неверный логин или пароль')
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'error',
          message: 'Неверные учётные данные администратора.',
        },
      })
    )
    return
  }

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'success',
        message: 'Вы успешно вошли в панель администратора.',
      },
    })
  )

  router.push({ name: 'admin-services' })
}
</script>

<template>
  <div class="flex flex-1 items-center justify-center py-6">
    <section class="am-section w-full max-w-md">
      <header class="mb-4 flex items-center gap-3 border-b border-slate-800 pb-3">
        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 ring-1 ring-slate-700/70"
        >
          <LockClosedIcon class="h-5 w-5 text-indigo-300" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-slate-50">
            Вход администратора
          </h1>
          <p class="text-xs text-slate-400">
            Доступ к управлению услугами и записями.
          </p>
        </div>
      </header>

      <Form
        class="space-y-4"
        :validation-schema="schema"
        @submit="handleSubmit"
      >
        <div>
          <label class="am-label" for="login">Логин</label>
          <div class="relative">
            <Field
              id="login"
              name="login"
              class="am-input pl-9"
              placeholder="admin"
            />
            <UserCircleIcon
              class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
          </div>
          <ErrorMessage
            name="login"
            class="mt-1 block text-xs text-red-400"
          />
        </div>

        <div>
          <label class="am-label" for="password">Пароль</label>
          <div class="relative">
            <Field
              id="password"
              name="password"
              type="password"
              class="am-input pl-9"
              placeholder="admin123"
            />
            <LockClosedIcon
              class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            />
          </div>
          <ErrorMessage
            name="password"
            class="mt-1 block text-xs text-red-400"
          />
        </div>

        <button
          type="submit"
          class="am-btn-primary flex w-full items-center justify-center gap-2"
        >
          
          <span>Войти</span>
        </button>

        <p class="mt-1 text-[11px] text-slate-500">
          Тестовые данные: логин <span class="font-mono">admin</span>, пароль
          <span class="font-mono">admin123</span>.
        </p>
      </Form>
    </section>
  </div>
</template>

