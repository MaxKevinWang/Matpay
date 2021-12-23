import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage, TxPlaceholder } from '@/models/chat.model'
import { RoomUserInfo, User } from '@/models/user.model'
import { MatrixRoomChatMessageEvent } from '@/interface/rooms_event.interface'
interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
      state.chat_log[payload] = {
        messages: []
      }
    },
    mutation_add_single_message_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      message: ChatMessage | TxPlaceholder,
      location?: number
    }) {
      const location = payload.location || 0
      state.chat_log[payload.room_id].messages.splice(location, 0, payload.message)
    }
  },
  actions: <ActionTree<State, any>>{
    parse_single_chat_message_event_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      message_event: MatrixRoomChatMessageEvent
    }) {
      const room_id = payload.room_id
      const users_info : Array<RoomUserInfo> = rootGetters['user/get_users_info_for_room'](room_id)
      const msg : ChatMessage = {
        sender: users_info.filter(u => u.user.user_id === payload.message_event.sender)[0].user,
        timestamp: new Date(payload.message_event.origin_server_ts),
        content: payload.message_event.content.body
      }
      const messages = state.chat_log[room_id].messages
      // Insertion sort
      let index = 0
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].timestamp.getTime() >= msg.timestamp.getTime()) {
          index = i
        }
      }
      commit('mutation_add_single_message_for_room', {
        room_id: room_id,
        message: msg,
        location: index
      })
    }
  },
  getters: <GetterTree<State, any>>{
    get_chat_log_for_room: (state: State) => (room_id: MatrixRoomID): ChatLog => {
      return state.chat_log[room_id] || { messages: [] }
    }
  }
}

// Testing
export default {
  state: chat_store.state,
  mutations: chat_store.mutations,
  actions: chat_store.actions,
  getters: chat_store.getters
}
