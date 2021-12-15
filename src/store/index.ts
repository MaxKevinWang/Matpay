import { createStore } from 'vuex'
import { auth_store } from '@/store/auth'
import { rooms_store } from '@/store/rooms'
import { sync_store } from '@/store/sync'

export default createStore({
  modules: {
    auth: auth_store,
    rooms: rooms_store,
    sync: sync_store
  },
  strict: process.env.NODE_ENV !== 'production' // Strict Mode
})
