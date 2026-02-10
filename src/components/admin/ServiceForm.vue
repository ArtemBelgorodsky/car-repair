<script setup>
import { computed } from 'vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { useAppStore } from '../../stores/appStore'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import LoaderSpinner from '../shared/LoaderSpinner.vue'

const props = defineProps({
  service: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close'])

const store = useAppStore()

const isEditMode = computed(() => !!props.service)

const schema = yup.object({
  name: yup.string().required('Введите название услуги'),
  description: yup.string().required('Добавьте описание услуги'),
  duration: yup
    .number()
    .typeError('Укажите длительность в часах')
    .positive('Длительность должна быть больше 0')
    .required('Укажите длительность'),
  price: yup
    .number()
    .typeError('Укажите стоимость')
    .min(0, 'Стоимость не может быть отрицательной')
    .required('Укажите стоимость'),
  category: yup.string().required('Выберите категорию'),
  color: yup
    .string()
    .required('Укажите цвет')
    .matches(/^#([0-9a-fA-F]{3}){1,2}$/, 'Цвет в формате HEX, например #1e40af'),
})

const initialValues = computed(() => ({
  name: props.service?.name ?? '',
  description: props.service?.description ?? '',
  duration: props.service?.duration ?? 1.5,
  price: props.service?.price ?? 0,
  category: props.service?.category ?? 'Техническое обслуживание',
  color: props.service?.color ?? '#1e40af',
}))

const handleSubmit = (values) => {
  if (isEditMode.value) {
    store.updateService(props.service.id, values)
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'success',
          message: 'Услуга успешно обновлена.',
        },
      })
    )
  } else {
    store.addService(values)
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'success',
          message: 'Новая услуга успешно добавлена.',
        },
      })
    )
  }
  emit('close')
}

const close = () => emit('close')
</script>

<template>
  <teleport to="body">
    <div class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div class="am-card w-full max-w-xl overflow-hidden border border-slate-700 bg-slate-950/95">
        <header class="flex items-center justify-between gap-3 border-b border-slate-800 px-5 py-3.5">
          <div>
            <h2 class="text-sm font-semibold text-slate-50">
              {{ isEditMode ? 'Редактирование услуги' : 'Новая услуга' }}
            </h2>
            <p class="text-xs text-slate-400">
              {{ isEditMode ? 'Измените параметры услуги и сохраните изменения.' : 'Заполните форму, чтобы добавить услугу.' }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
            @click="close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </header>

        <Form
          class="grid gap-3 p-5 text-sm sm:grid-cols-2"
          :validation-schema="schema"
          :initial-values="initialValues"
          @submit="handleSubmit"
        >
          <div class="sm:col-span-2">
            <label class="am-label" for="name">Название услуги</label>
            <Field
              id="name"
              name="name"
              class="am-input"
              placeholder="Например, Замена масла и фильтров"
            />
            <ErrorMessage
              name="name"
              class="mt-1 block text-xs text-red-400"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="am-label" for="description">Описание</label>
            <Field
              id="description"
              name="description"
              as="textarea"
              rows="3"
              class="am-input resize-none"
              placeholder="Кратко опишите, что входит в услугу"
            />
            <ErrorMessage
              name="description"
              class="mt-1 block text-xs text-red-400"
            />
          </div>

          <div>
            <label class="am-label" for="duration">Длительность (часы)</label>
            <Field
              id="duration"
              name="duration"
              type="number"
              step="0.5"
              min="0.5"
              class="am-input"
            />
            <ErrorMessage
              name="duration"
              class="mt-1 block text-xs text-red-400"
            />
          </div>

          <div>
            <label class="am-label" for="price">Стоимость (₽)</label>
            <Field
              id="price"
              name="price"
              type="number"
              min="0"
              class="am-input"
            />
            <ErrorMessage
              name="price"
              class="mt-1 block text-xs text-red-400"
            />
          </div>

          <div>
            <label class="am-label" for="category">Категория</label>
            <Field
              id="category"
              name="category"
              as="select"
              class="am-input"
            >
              <option value="Техническое обслуживание">
                Техническое обслуживание
              </option>
              <option value="Кузовной ремонт">
                Кузовной ремонт
              </option>
              <option value="Диагностика">
                Диагностика
              </option>
            </Field>
            <ErrorMessage
              name="category"
              class="mt-1 block text-xs text-red-400"
            />
          </div>

          <div>
            <label class="am-label" for="color">Цвет услуги</label>
            <div class="flex items-center gap-2">
              <Field
                id="color"
                name="color"
                class="am-input"
                placeholder="#1e40af"
              />
              <Field
                name="color"
                v-slot="{ field }"
              >
                <span
                  class="inline-block h-9 w-9 rounded-lg border border-slate-700"
                  :style="{ backgroundColor: field.value || '#1e40af' }"
                />
              </Field>
            </div>
            <ErrorMessage
              name="color"
              class="mt-1 block text-xs text-red-400"
            />
          </div>

          <div class="sm:col-span-2 mt-2 flex justify-end gap-2 border-t border-slate-800 pt-3">
            <button
              type="button"
              class="am-btn-secondary"
              @click="close"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="am-btn-primary min-w-[140px] justify-center"
            >
              <LoaderSpinner />
              <span>{{ isEditMode ? 'Сохранить' : 'Добавить услугу' }}</span>
            </button>
          </div>
        </Form>
      </div>
    </div>
  </teleport>
</template>

