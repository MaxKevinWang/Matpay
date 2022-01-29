import { createStore } from 'vuex'
import { auth_store } from '@/store/auth'
import { rooms_store } from '@/store/rooms'
import { sync_store } from '@/store/sync'
import { user_store } from '@/store/user'
import { chat_store } from '@/store/chat'
import { tx_store } from '@/store/tx'
import { MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { TX_MESSAGE_EVENT_TYPES, TxMessageEvent } from '@/interface/tx_event.interface'

const normal_stores = ['rooms', 'user', 'tx', 'chat']
let is_long_poll_enabled = false
export function newStore () {
  return createStore({
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
            case 'auth/mutation_logout': {
              // stop syncing
              is_long_poll_enabled = false
              // remove all existing states
              for (const st of normal_stores.concat(['sync'])) {
                store.commit(`${st}/mutation_reset_state`)
              }
              break
            }
            case 'auth/mutation_init_state_incomplete': {
              // stop syncing
              is_long_poll_enabled = false
              break
            }
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
                if (!store.state.sync.init_state_complete) {
                  store.commit('rooms/mutation_add_state_event_for_joined_room', {
                    room_id: room_id,
                    state_event: room_event as MatrixRoomStateEvent
                  })
                } else {
                  store.dispatch('rooms/action_parse_single_state_event_for_room', {
                    room_id: room_id,
                    state_event: room_event as MatrixRoomStateEvent
                  })
                }
              }
              if (['m.room.message'].includes(room_event.type)) {
                if (room_event.content.msgtype === 'm.text') {
                  store.dispatch('chat/action_parse_single_chat_message_event_for_room', {
                    room_id: room_id,
                    message_event: room_event
                  })
                }
              }
              if (['com.matpay.reject'].includes(room_event.type)) {
                console.log('Parse rejection here')
              }
              if (TX_MESSAGE_EVENT_TYPES.includes(room_event.type)) {
                if (store.state.sync.room_tx_sync_complete[room_id]) {
                  store.dispatch('tx/action_parse_single_tx_event_for_room', {
                    room_id: room_id,
                    tx_event: room_event as TxMessageEvent
                  })
                }
              }
              break
            }
            case 'sync/mutation_init_state_complete': {
              store.dispatch('rooms/action_parse_state_events_for_all_rooms')
              // eslint-disable-next-line no-unmodified-loop-condition
              is_long_poll_enabled = true
              const long_poll = async function () {
                if (is_long_poll_enabled) {
                  await store.dispatch('sync/action_update_state', {
                    timeout: 10000
                  })
                  setTimeout(long_poll, 1000)
                }
              }
              long_poll()
              break
            }
            case 'sync/mutation_room_tx_sync_state_complete': {
              const room_id = mutation.payload as MatrixRoomID
              const tx_message_events = (store.state.sync.room_events[room_id] as Array<MatrixRoomEvent>)
                .filter(e => new Set(TX_MESSAGE_EVENT_TYPES).has(e.type))
              store.dispatch('tx/action_parse_all_tx_events_for_room', {
                room_id: room_id,
                tx_events: tx_message_events
              })
              break
            }
          }
        })
      }
    ],
    strict: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' // Strict Mode
  })
}

export default newStore()
