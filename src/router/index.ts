import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../views/LandingPage.vue'
import Collections from '@/views/Collections.vue'
import Custom from '@/views/Custom.vue'
import Faq from '@/views/Faq.vue'
import Asana from '@/views/Asana.vue'
import Press from '@/views/Press.vue'
import ContactPage from '@/views/ContactPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPage
    },
    {
      path: '/collections',
      name: 'collections',
      component: Collections
    },
    {
      path: '/custom',
      name: 'custom',
      component: Custom
    },
    {
      path: '/faq',
      name: 'faq',
      component: Faq
    },
    {
      path: '/asana-kemuwa',
      name: 'asana-kemuwa',
      component: Asana
    },
    
    {
      path: '/press',
      name: 'press',
      component: Press
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactPage
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    return {
      top: 0,
      left: 0,
      behavior: 'smooth'
    }
  }
})

export default router
