import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../tabs/Home.vue'
import Login from '@/tabs/Login.vue'
import Rooms from '@/tabs/Rooms.vue'
import RoomDetail from '@/views/RoomDetail.vue'

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

export default router
