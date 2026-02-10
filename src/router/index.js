import { createRouter, createWebHistory } from 'vue-router'
import { useAppStore } from '../stores/appStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'public',
      component: () => import('../views/PublicView.vue'),
      meta: {
        public: true,
      },
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: () => import('../components/admin/AdminLogin.vue'),
      meta: {
        public: true,
      },
    },
    {
      path: '/admin',
      component: () => import('../components/admin/AdminLayout.vue'),
      meta: {
        requiresAuth: true,
      },
      children: [
        {
          path: '',
          redirect: { name: 'admin-services' },
        },
        {
          path: 'services',
          name: 'admin-services',
          component: () => import('../views/AdminServicesView.vue'),
        },
        {
          path: 'appointments',
          name: 'admin-appointments',
          component: () => import('../views/AdminAppointmentsView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

// Простой глобальный гард для защиты админ‑маршрутов
router.beforeEach((to) => {
  const store = useAppStore()

  if (to.meta.public) {
    return true
  }

  if (to.meta.requiresAuth && !store.isAdminLogged) {
    return { name: 'admin-login' }
  }

  return true
})

export default router
