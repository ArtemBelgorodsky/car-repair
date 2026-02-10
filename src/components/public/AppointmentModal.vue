<script setup>
import { computed, ref, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import ScheduleVisual from './ScheduleVisual.vue'
import LoaderSpinner from '../shared/LoaderSpinner.vue'
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { XMarkIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  service: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const store = useAppStore()

const isSubmitting = ref(false)
const selectedDate = ref(new Date().toISOString().slice(0, 10))

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      selectedDate.value = new Date().toISOString().slice(0, 10)
    }
  }
)

const schema = yup.object({
  clientName: yup.string().required('Введите имя клиента'),
  clientPhone: yup
    .string()
    .required('Введите телефон')
    .matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Телефон в формате +7 (XXX) XXX-XX-XX'),
  clientCar: yup.string().required('Укажите автомобиль'),
  date: yup.string().required('Выберите дату'),
  time: yup.string().required('Выберите время'),
  notes: yup.string().max(500, 'Максимум 500 символов').nullable(),
})

const defaultValues = computed(() => ({
  clientName: '',
  clientPhone: '',
  clientCar: '',
  date: selectedDate.value,
  time: '',
  notes: '',
}))

const close = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async (values, { resetForm }) => {
  isSubmitting.value = true
  try {
    store.addAppointment({
      ...values,
      serviceId: props.service.id,
      status: 'ожидает',
    })

    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'success',
          message: 'Заявка успешно создана и отправлена на подтверждение.',
        },
      })
    )

    resetForm()
    close()
  } catch (e) {
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: {
          type: 'error',
          message: 'Не удалось создать запись. Попробуйте ещё раз.',
        },
      })
    )
  } finally {
    isSubmitting.value = false
  }
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
  <teleport to="body">
    <transition
      enter-active-class="duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      >
        <div
          class="am-card relative w-full max-w-xl overflow-hidden border border-slate-700 bg-slate-950/95"
        >
          <header
            class="border-b border-slate-800 bg-gradient-to-r from-indigo-600/20 via-slate-900 to-slate-900 px-5 py-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
                  Запись на услугу
                </p>
                <h2 class="mt-1 text-lg font-semibold text-slate-50">
                  {{ service.name }}
                </h2>
              </div>
              <button
                type="button"
                class="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                @click="close"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </header>

          <Form
            class="grid gap-4 p-4 sm:grid-cols-2 sm:p-5"
            :validation-schema="schema"
            :initial-values="defaultValues"
            @submit="handleSubmit"
          >
            <div class="space-y-3 sm:col-span-1">
              <div>
                <label class="am-label" for="clientName">Имя клиента</label>
                <Field
                  id="clientName"
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
                <label class="am-label" for="clientPhone">Телефон</label>
                <Field
                  v-slot="{ field }"
                  name="clientPhone"
                >
                  <input
                    id="clientPhone"
                    v-bind="field"
                    class="am-input"
                    type="tel"
                    placeholder="+7 (900) 000-00-00"
                    @input="(event) => formatPhone(event, field)"
                  >
                </Field>
                <ErrorMessage
                  name="clientPhone"
                  class="mt-1 block text-xs text-red-400"
                />
              </div>

              <div>
                <label class="am-label" for="clientCar">Автомобиль</label>
                <Field
                  id="clientCar"
                  name="clientCar"
                  class="am-input"
                  placeholder="Например, Toyota Camry 2020"
                />
                <ErrorMessage
                  name="clientCar"
                  class="mt-1 block text-xs text-red-400"
                />
              </div>
            </div>

            <div class="space-y-3 sm:col-span-1">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="am-label" for="date">Желаемая дата</label>
                  <Field
                    id="date"
                    v-model="selectedDate"
                    name="date"
                    type="date"
                    class="am-input"
                  />
                  <ErrorMessage
                    name="date"
                    class="mt-1 block text-xs text-red-400"
                  />
                </div>

                <div>
                  <label class="am-label" for="time">Желаемое время</label>
                  <Field
                    id="time"
                    name="time"
                    as="select"
                    class="am-input"
                  >
                    <option value="">
                      Выберите время
                    </option>
                    <option
                      v-for="slot in ['09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30']"
                      :key="slot"
                      :value="slot"
                    >
                      {{ slot }}
                    </option>
                  </Field>
                  <ErrorMessage
                    name="time"
                    class="mt-1 block text-xs text-red-400"
                  />
                </div>
              </div>

              <div>
                <label class="am-label" for="notes">Примечания</label>
                <Field
                  id="notes"
                  name="notes"
                  as="textarea"
                  rows="3"
                  class="am-input resize-none"
                  placeholder="Любые дополнительные комментарии для мастера"
                />
                <ErrorMessage
                  name="notes"
                  class="mt-1 block text-xs text-red-400"
                />
              </div>
            </div>

            <div class="sm:col-span-2">
              <ScheduleVisual
                :service-id="service.id"
                :date="selectedDate"
                :duration-hours="service.duration"
              />
            </div>

            <div class="sm:col-span-2 flex flex-col gap-3 border-t border-slate-800/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-xs text-slate-400">
                После отправки заявки администратор свяжется с вами для подтверждения времени.
              </p>
              <div class="flex gap-2">
                <button
                  type="button"
                  class="am-btn-secondary"
                  @click="close"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  class="am-btn-primary min-w-[130px] justify-center"
                  :disabled="isSubmitting"
                >
                  <LoaderSpinner v-if="isSubmitting" />
                  <span v-else>Отправить заявку</span>
                </button>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </transition>
  </teleport>
</template>

