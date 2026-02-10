<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

// Простой глобальный тост‑центр на основе window CustomEvent
// Чтобы показать тост, из любого места приложения можно вызвать:
// window.dispatchEvent(new CustomEvent('app:toast', { detail: { type: 'success', message: 'Текст сообщения' } }))

const isVisible = ref(false)
const message = ref('')
const type = ref('info')

let hideTimer = null

const hide = () => {
  isVisible.value = false
  message.value = ''
  type.value = 'info'
}

const show = (payload) => {
  const { message: msg, type: t = 'info', timeout = 3500 } = payload || {}
  if (!msg) return

  message.value = msg
  type.value = t
  isVisible.value = true

  if (hideTimer) {
    clearTimeout(hideTimer)
  }
  hideTimer = setTimeout(hide, timeout)
}

const handleToastEvent = (event) => {
  show(event.detail)
}

onMounted(() => {
  window.addEventListener('app:toast', handleToastEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('app:toast', handleToastEvent)
  if (hideTimer) clearTimeout(hideTimer)
})
</script>

<template>
  <transition
    enter-active-class="transform transition duration-200"
    enter-from-class="translate-y-3 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transform transition duration-150"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-3 opacity-0"
  >
    <div
      v-if="isVisible"
      class="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-6 sm:justify-end sm:px-6"
    >
      <div
        class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-slate-700/70 bg-slate-900/95 p-3 shadow-lg shadow-slate-950/70"
        :class="{
          'border-emerald-500/60 bg-emerald-950/70': type === 'success',
          'border-red-500/60 bg-red-950/70': type === 'error',
          'border-amber-500/60 bg-amber-950/70': type === 'warning',
          'border-slate-700/70 bg-slate-900/95': type === 'info',
        }"
      >
        <span
          class="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-lg text-sm"
          :class="{
            'bg-emerald-500/15 text-emerald-400': type === 'success',
            'bg-red-500/15 text-red-400': type === 'error',
            'bg-amber-500/15 text-amber-400': type === 'warning',
            'bg-slate-500/15 text-slate-300': type === 'info',
          }"
        >
          <span v-if="type === 'success'">✓</span>
          <span v-else-if="type === 'error'">!</span>
          <span v-else-if="type === 'warning'">!</span>
          <span v-else>i</span>
        </span>
        <div class="flex-1 text-sm text-slate-100">
          {{ message }}
        </div>
        <button
          type="button"
          class="ml-1 inline-flex flex-none items-center rounded-md p-1 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          @click="hide"
        >
          Закрыть
        </button>
      </div>
    </div>
  </transition>
</template>

