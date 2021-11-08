import { createStore } from 'vuex'
import { auth_store } from '@/store/auth'
import { rooms_store } from '@/store/rooms'
import { user_profile_store } from '@/store/user_profile'

export default createStore({
  modules: {
    auth: auth_store,
    rooms: rooms_store,
    user_profile: user_profile_store
  },
  strict: process.env.NODE_ENV !== 'production' // Strict Mode
})
