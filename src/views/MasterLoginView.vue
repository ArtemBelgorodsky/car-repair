<script setup>
import { useRouter } from 'vue-router'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useAppStore } from '../stores/appStore'
import { LockClosedIcon, UserCircleIcon, WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const store = useAppStore()

const schema = yup.object({
  login: yup.string().required('Введите логин'),
  password: yup.string().required('Введите пароль'),
})

const testCredentials = [
  {
    name: 'Андрей Мельников',
    login: 'master1',
    password: 'master123',
  },
  {
    name: 'Виктор Лебедев',
    login: 'master2',
    password: 'diag123',
  },
  {
    name: 'Илья Морозов',
    login: 'master3',
    password: 'brake123',
  },
]

const handleSubmit = (values, { setFieldError }) => {
  const ok = store.loginEmployee(values.login, values.password)

  if (!ok) {
    setFieldError('password', 'Неверный логин или пароль')
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'error',
          message: 'Неверные учётные данные мастера.',
        },
      })
    )
    return
  }

  window.dispatchEvent(
    new CustomEvent('app:toast', {
      detail: {
        type: 'success',
        message: 'Вы вошли в кабинет мастера.',
      },
    })
  )

  router.push({ name: 'master' })
}
</script>

<template>
  <div class="flex flex-1 items-center justify-center py-6">
    <section class="am-section w-full max-w-xl">
      <header class="mb-4 flex items-center gap-3 border-b border-slate-800 pb-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 ring-1 ring-slate-700/70">
          <WrenchScrewdriverIcon class="h-5 w-5 text-indigo-300" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-slate-50">
            Вход мастера
          </h1>
          <p class="text-xs text-slate-400">
            Доступ к назначенным работам и выплатам.
          </p>
        </div>
      </header>

      <Form
        class="space-y-4"
        :validation-schema="schema"
        @submit="handleSubmit"
      >
        <div>
          <label class="am-label" for="masterLogin">Логин</label>
          <div class="relative">
            <Field
              id="masterLogin"
              name="login"
              class="am-input pl-9"
              placeholder="master1"
            />
            <UserCircleIcon class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
          <ErrorMessage
            name="login"
            class="mt-1 block text-xs text-red-400"
          />
        </div>

        <div>
          <label class="am-label" for="masterPassword">Пароль</label>
          <div class="relative">
            <Field
              id="masterPassword"
              name="password"
              type="password"
              class="am-input pl-9"
              placeholder="master123"
            />
            <LockClosedIcon class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          </div>
          <ErrorMessage
            name="password"
            class="mt-1 block text-xs text-red-400"
          />
        </div>

        <button
          type="submit"
          class="am-btn-primary w-full"
        >
          Войти
        </button>
      </Form>

      <div class="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
        <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Тестовые данные мастеров
        </p>
        <div class="grid gap-2 text-xs">
          <div
            v-for="item in testCredentials"
            :key="item.login"
            class="grid gap-1 rounded-lg bg-slate-900/70 p-2 sm:grid-cols-[1fr_auto_auto]"
          >
            <span class="text-slate-200">{{ item.name }}</span>
            <span class="font-mono text-indigo-200">логин: {{ item.login }}</span>
            <span class="font-mono text-emerald-200">пароль: {{ item.password }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
