import { createStore } from 'vuex'
import { auth_store } from '@/store/auth'

export default createStore({
  modules: {
    auth: auth_store
  },
  strict: process.env.NODE_ENV !== 'production' // Strict Mode
})
