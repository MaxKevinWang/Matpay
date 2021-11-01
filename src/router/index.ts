import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../tabs/Home.vue'
import Login from '@/tabs/Login.vue'
import Rooms from '@/tabs/Rooms.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/rooms',
    name: 'Room',
    component: Rooms
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
