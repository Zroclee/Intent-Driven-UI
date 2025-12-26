import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/home',
      name: 'home',
      component: HomeView
    },
    {
      path: '/ai',
      name: 'AiCockpitView',
      component: () => import('../views/AiCockpitView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/ai'
    }
  ]
})

export default router
