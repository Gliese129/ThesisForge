import { createMemoryHistory, createRouter, type RouteRecordRaw } from 'vue-router'

import CreateArticle from '@/pages/create-article/index.vue'

const routes = [
  {
    path: '/',
    component: CreateArticle,
  },
  {
    path: '/create-article',
    component: CreateArticle,
  },
] as RouteRecordRaw[]

const router = createRouter({
  history: createMemoryHistory(),
  routes,
})

export default router