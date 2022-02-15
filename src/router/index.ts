import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Login from '@/tabs/Login.vue'
import Rooms from '@/tabs/Rooms.vue'
import RoomDetail from '@/views/RoomDetail.vue'
import RoomTxHistory from '@/views/RoomTxHistory.vue'
import Register from '@/views/Register.vue'

export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'default',
    component: Rooms
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
  },
  {
    path: '/history/:room_id/:current_group_id?',
    name: 'room_history',
    component: RoomTxHistory
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})
router.beforeEach((to, from) => {
  if (to.name === 'login' || to.name === 'register') {
    return
  }
  if (!localStorage.getItem('access_token')) {
    router.push({ name: 'login' })
  }
})
export default router
