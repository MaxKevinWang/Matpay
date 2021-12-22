import { createStore } from 'vuex'
import { auth_store } from '@/store/auth'
import { rooms_store } from '@/store/rooms'
import { sync_store } from '@/store/sync'
import { user_store } from '@/store/user'
import { chat_store } from '@/store/chat'
import { tx_store } from '@/store/tx'
import { MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'

const normal_stores = ['rooms', 'user', 'tx', 'chat']
export default createStore({
  modules: {
    auth: auth_store,
    rooms: rooms_store,
    sync: sync_store,
    user: user_store,
    chat: chat_store,
    tx: tx_store
  },
  plugins: [
    (store) => {
      store.subscribe((mutation, state) => {
        const type = mutation.type
        switch (type) {
          case 'sync/mutation_create_new_room': {
            const payload: MatrixRoomID = mutation.payload
            for (const st of normal_stores) {
              store.commit(`${st}/mutation_init_joined_room`, payload)
            }
            break
          }
          case 'sync/mutation_process_event': {
            const {
              room_id,
              event: room_event
            } = mutation.payload as {
              room_id: MatrixRoomID,
              event: MatrixRoomEvent
            }
            // Event distinguishing starts here
            if (['m.room.member', 'm.room.power_levels', 'm.room.name'].includes(room_event.type)) {
              store.commit('rooms/mutation_add_state_event_for_joined_room', {
                room_id: room_id,
                state_event: room_event as MatrixRoomStateEvent
              })
            }
            // more here
            break
          }
          case 'sync/mutation_init_state_complete': {
            store.dispatch('rooms/action_parse_state_events_for_all_rooms')
          }
        }
      })
    }
  ],
  strict: process.env.NODE_ENV !== 'production' // Strict Mode
})
