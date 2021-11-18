import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../tabs/Home.vue'
import Login from '@/tabs/Login.vue'
import Rooms from '@/tabs/Rooms.vue'
import RoomDetail from '@/views/RoomDetail.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/rooms',
    name: 'rooms',
    component: Rooms
  },
  {
    path: '/room/:room_id',
    name: 'room_detail',
    component: RoomDetail
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from) => {
  if (to.name === 'login' || to.name === 'home') {
    return
  }
  if (!localStorage.getItem('access_token')) {
    router.push({ name: 'login' })
  }
})
export default router
