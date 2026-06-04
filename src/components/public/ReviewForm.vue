<script setup>
import { ref } from 'vue'
import { useAppStore } from '../../stores/appStore'
import LoaderSpinner from '../shared/LoaderSpinner.vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { ChatBubbleLeftRightIcon, StarIcon } from '@heroicons/vue/24/outline'

const store = useAppStore()
const isSubmitting = ref(false)

const schema = yup.object({
  clientName: yup.string().required('Введите имя'),
  rating: yup.number().required('Поставьте оценку').min(1, 'Минимальная оценка 1').max(5, 'Максимальная оценка 5'),
  comment: yup.string().required('Напишите комментарий').max(600, 'Максимум 600 символов'),
})

const initialValues = {
  clientName: store.currentUser?.name ?? '',
  rating: 5,
  comment: '',
}

const handleSubmit = async (values, { resetForm }) => {
  isSubmitting.value = true

  try {
    store.addReview({
      clientName: values.clientName.trim(),
      rating: Number(values.rating),
      comment: values.comment.trim(),
    })

    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'success',
          message: 'Спасибо! Ваш отзыв добавлен.',
        },
      })
    )

    resetForm({
      values: {
        ...initialValues,
        clientName: store.currentUser?.name ?? '',
      },
    })
  } catch (e) {
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'error',
          message: 'Не удалось отправить отзыв. Попробуйте ещё раз.',
        },
      })
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="am-section space-y-4">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p class="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          <ChatBubbleLeftRightIcon class="h-4 w-4" />
          Отзывы клиентов
        </p>
        <h2 class="mt-1 text-base font-semibold text-slate-50">
          Оставьте отзыв о работе автосервиса
        </h2>
      </div>
      <div class="rounded-lg bg-slate-950/60 px-3 py-2 text-right ring-1 ring-slate-800">
        <p class="text-[11px] uppercase tracking-[0.14em] text-slate-500">
          Всего отзывов
        </p>
        <p class="text-lg font-semibold text-slate-100">
          {{ store.reviews.length }}
        </p>
      </div>
    </header>

    <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
      <Form
        class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px]"
        :validation-schema="schema"
        :initial-values="initialValues"
        @submit="handleSubmit"
      >
        <div>
          <label class="am-label" for="reviewClientName">Ваше имя</label>
          <Field
            id="reviewClientName"
            name="clientName"
            class="am-input"
            placeholder="Например, Иван Петров"
          />
          <ErrorMessage
            name="clientName"
            class="mt-1 block text-xs text-red-400"
          />
        </div>

        <div>
          <label class="am-label" for="reviewRating">Оценка</label>
          <Field
            id="reviewRating"
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

        <div class="sm:col-span-2">
          <label class="am-label" for="reviewComment">Комментарий</label>
          <Field
            id="reviewComment"
            name="comment"
            as="textarea"
            rows="4"
            class="am-input resize-none"
            placeholder="Расскажите, что понравилось или что можно улучшить"
          />
          <ErrorMessage
            name="comment"
            class="mt-1 block text-xs text-red-400"
          />
        </div>

        <div class="flex flex-col gap-3 border-t border-slate-800/70 pt-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-slate-400">
            Дата и время отзыва сохраняются автоматически при отправке.
          </p>
          <button
            type="submit"
            class="am-btn-primary min-w-[140px]"
            :disabled="isSubmitting"
          >
            <LoaderSpinner v-if="isSubmitting" />
            <span v-else>Отправить отзыв</span>
          </button>
        </div>
      </Form>

      <div class="space-y-2">
        <article
          v-for="review in store.reviews.slice(-2).reverse()"
          :key="review.id"
          class="rounded-lg bg-slate-950/60 p-3 ring-1 ring-slate-800"
        >
          <div class="flex items-center justify-between gap-2">
            <p class="font-medium text-slate-100">
              {{ review.clientName }}
            </p>
            <span class="inline-flex items-center gap-1 text-xs text-amber-200">
              <StarIcon class="h-4 w-4 fill-amber-300 stroke-amber-300" />
              {{ review.rating }}/5
            </span>
          </div>
          <p class="mt-2 line-clamp-3 text-sm text-slate-300">
            {{ review.comment }}
          </p>
          <p class="mt-2 text-[11px] text-slate-500">
            {{ new Date(review.createdAt).toLocaleString('ru-RU') }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>
