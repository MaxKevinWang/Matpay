import { createStore } from 'vuex'
import { auth_store } from '@/store/auth'
import { rooms_store } from '@/store/rooms'
import { sync_store } from '@/store/sync'
import { user_store } from '@/store/user'
import { chat_store } from '@/store/chat'
import { tx_store } from '@/store/tx'

export default createStore({
  modules: {
    auth: auth_store,
    rooms: rooms_store,
    sync: sync_store,
    user: user_store,
    chat: chat_store,
    tx: tx_store
  },
  strict: process.env.NODE_ENV !== 'production' // Strict Mode
})
