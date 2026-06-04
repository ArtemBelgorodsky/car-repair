<script setup>
import { computed, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import LoaderSpinner from '../components/shared/LoaderSpinner.vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  StarIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const store = useAppStore()
const isSubmitting = ref(false)

const service = computed(() =>
  store.services.find((item) => item.id === route.params.serviceId) ?? null
)

const serviceReviews = computed(() =>
  [...store.reviews]
    .filter((review) => review.serviceId === service.value?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
)

const completedAppointments = computed(() =>
  store.userAppointments.filter(
    (appointment) =>
      appointment.serviceId === service.value?.id &&
      appointment.status === 'выполнена'
  )
)

const pendingAppointments = computed(() =>
  store.userAppointments.filter(
    (appointment) =>
      appointment.serviceId === service.value?.id &&
      appointment.status !== 'выполнена' &&
      appointment.status !== 'отменена'
  )
)

const reviewedAppointmentIds = computed(
  () => new Set(store.reviews.map((review) => review.appointmentId).filter(Boolean))
)

const reviewableAppointments = computed(() =>
  completedAppointments.value.filter(
    (appointment) => !reviewedAppointmentIds.value.has(appointment.id)
  )
)

const averageRating = computed(() => {
  if (serviceReviews.value.length === 0) return '0.0'
  const total = serviceReviews.value.reduce((sum, review) => sum + Number(review.rating), 0)
  return (total / serviceReviews.value.length).toFixed(1)
})

const schema = yup.object({
  appointmentId: yup.string().required('Выберите выполненную запись'),
  rating: yup.number().required('Поставьте оценку').min(1, 'Минимальная оценка 1').max(5, 'Максимальная оценка 5'),
  comment: yup.string().required('Напишите комментарий').max(600, 'Максимум 600 символов'),
})

const goToAuth = () => {
  router.push({
    name: 'user-login',
    query: {
      redirect: route.fullPath,
    },
  })
}

const handleSubmit = async (values, { resetForm }) => {
  if (!store.currentUser || !service.value) {
    goToAuth()
    return
  }

  const appointment = reviewableAppointments.value.find((item) => item.id === values.appointmentId)

  if (!appointment) {
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'error',
          message: 'Отзыв можно оставить только после выполненной записи.',
        },
      })
    )
    return
  }

  isSubmitting.value = true

  try {
    const ok = store.addReview({
      serviceId: service.value.id,
      appointmentId: appointment.id,
      userId: store.currentUser.id,
      clientName: store.currentUser.name,
      rating: Number(values.rating),
      comment: values.comment.trim(),
    })

    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: ok ? 'success' : 'error',
          message: ok
            ? 'Спасибо! Ваш отзыв добавлен.'
            : 'Этот отзыв нельзя добавить: запись ещё не выполнена или отзыв уже оставлен.',
        },
      })
    )

    if (ok) {
      resetForm({
        values: {
          appointmentId: '',
          rating: 5,
          comment: '',
        },
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="flex flex-1 flex-col gap-5 py-2 sm:py-4">
    <section
      v-if="!service"
      class="am-section py-10 text-center"
    >
      <h1 class="text-base font-semibold text-slate-50">
        Услуга не найдена
      </h1>
      <RouterLink
        to="/"
        class="am-btn-primary mt-4"
      >
        На главную
      </RouterLink>
    </section>

    <template v-else>
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <RouterLink
            to="/"
            class="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-100"
          >
            <ArrowLeftIcon class="h-4 w-4" />
            Назад к услугам
          </RouterLink>
          <p class="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            <ChatBubbleLeftRightIcon class="h-4 w-4" />
            Отзывы об услуге
          </p>
          <h1 class="mt-1 text-xl font-semibold text-slate-50">
            {{ service.name }}
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-slate-400">
            Оставить отзыв можно только после того, как администратор переведёт вашу запись по этой услуге в статус «выполнена».
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="rounded-lg bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800">
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Средняя оценка
            </p>
            <p class="mt-0.5 font-semibold text-amber-200">
              {{ averageRating }} / 5
            </p>
          </div>
          <div class="rounded-lg bg-slate-900/80 px-3 py-2 ring-1 ring-slate-800">
            <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">
              Отзывов
            </p>
            <p class="mt-0.5 font-semibold text-slate-100">
              {{ serviceReviews.length }}
            </p>
          </div>
        </div>
      </header>

      <section class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div class="am-section space-y-3">
          <header class="flex items-center justify-between text-xs text-slate-300">
            <h2 class="font-semibold text-slate-100">
              Отзывы клиентов
            </h2>
            <p class="text-[11px] text-slate-400">
              Новые отзывы отображаются первыми.
            </p>
          </header>

          <div
            v-if="serviceReviews.length === 0"
            class="rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-8 text-center text-sm text-slate-400"
          >
            По этой услуге пока нет отзывов.
          </div>

          <article
            v-for="review in serviceReviews"
            v-else
            :key="review.id"
            class="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
          >
            <div class="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p class="font-medium text-slate-100">
                  {{ review.clientName }}
                </p>
                <p class="mt-1 text-[11px] text-slate-500">
                  {{ new Date(review.createdAt).toLocaleString('ru-RU') }}
                </p>
              </div>
              <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-1 text-xs text-amber-100 ring-1 ring-amber-500/40">
                <StarIcon class="h-3.5 w-3.5 fill-amber-300 stroke-amber-300" />
                {{ review.rating }}/5
              </span>
            </div>
            <p class="mt-3 text-sm leading-relaxed text-slate-300">
              {{ review.comment }}
            </p>
          </article>
        </div>

        <aside class="am-section h-fit space-y-4">
          <header>
            <h2 class="text-base font-semibold text-slate-50">
              Оставить отзыв
            </h2>
            <p class="mt-1 text-xs text-slate-400">
              Форма доступна после выполненной записи на эту услугу.
            </p>
          </header>

          <div
            v-if="!store.currentUser"
            class="space-y-3 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-sm text-amber-100"
          >
            <p>
              Войдите в личный кабинет, чтобы оставить отзыв по своей записи.
            </p>
            <button
              type="button"
              class="am-btn-primary w-full"
              @click="goToAuth"
            >
              Войти или зарегистрироваться
            </button>
          </div>

          <div
            v-else-if="reviewableAppointments.length === 0 && pendingAppointments.length > 0"
            class="rounded-xl border border-sky-500/40 bg-sky-950/30 p-3 text-sm text-sky-100"
          >
            Дождитесь, чтобы администратор поставил статус «выполнена» по вашей записи. После этого здесь появится форма отзыва.
          </div>

          <div
            v-else-if="reviewableAppointments.length === 0 && completedAppointments.length > 0"
            class="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-3 text-sm text-emerald-100"
          >
            Вы уже оставили отзыв по выполненной записи на эту услугу.
          </div>

          <div
            v-else-if="reviewableAppointments.length === 0"
            class="rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-sm text-slate-300"
          >
            У вас пока нет записи на эту услугу. Сначала запишитесь, дождитесь выполнения работы, затем сможете оставить отзыв.
          </div>

          <Form
            v-else
            class="space-y-3"
            :validation-schema="schema"
            :initial-values="{ appointmentId: '', rating: 5, comment: '' }"
            @submit="handleSubmit"
          >
            <div>
              <label
                class="am-label"
                for="appointmentId"
              >
                Выполненная запись
              </label>
              <Field
                id="appointmentId"
                name="appointmentId"
                as="select"
                class="am-input"
              >
                <option value="">
                  Выберите запись
                </option>
                <option
                  v-for="appointment in reviewableAppointments"
                  :key="appointment.id"
                  :value="appointment.id"
                >
                  {{ new Date(appointment.date).toLocaleDateString('ru-RU') }} в {{ appointment.time }}
                </option>
              </Field>
              <ErrorMessage
                name="appointmentId"
                class="mt-1 block text-xs text-red-400"
              />
            </div>

            <div>
              <label
                class="am-label"
                for="rating"
              >
                Оценка
              </label>
              <Field
                id="rating"
                name="rating"
                as="select"
                class="am-input"
              >
                <option
                  v-for="value in [5, 4, 3, 2, 1]"
                  :key="value"
                  :value="value"
                >
                  {{ value }} из 5
                </option>
              </Field>
              <ErrorMessage
                name="rating"
                class="mt-1 block text-xs text-red-400"
              />
            </div>

            <div>
              <label
                class="am-label"
                for="comment"
              >
                Комментарий
              </label>
              <Field
                id="comment"
                name="comment"
                as="textarea"
                rows="4"
                class="am-input resize-none"
                placeholder="Расскажите, как прошла услуга"
              />
              <ErrorMessage
                name="comment"
                class="mt-1 block text-xs text-red-400"
              />
            </div>

            <button
              type="submit"
              class="am-btn-primary w-full"
              :disabled="isSubmitting"
            >
              <LoaderSpinner v-if="isSubmitting" />
              <span v-else>Отправить отзыв</span>
            </button>
          </Form>
        </aside>
      </section>
    </template>
  </div>
</template>
