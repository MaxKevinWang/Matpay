import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage } from '@/models/chat.model'
import { User } from '@/models/user.model'
interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
  processed_events: Set<MatrixEventID>
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {},
      processed_events: new Set()
    }
  },
  mutations: <MutationTree<State>>{
    mutation_add_processed_event (state: State, payload: MatrixEventID) {
      state.processed_events.add(payload)
    },
    mutation_init_chat_log_for_room (state: State, payload: MatrixRoomID) {
      state.chat_log[payload] = {
        messages: []
      }
    },
    mutation_add_chat_log_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      chat_log: ChatLog
    }) {
      state.chat_log[payload.room_id].messages = state.chat_log[payload.room_id].messages.concat(payload.chat_log.messages)
    }
  },
  actions: <ActionTree<State, any>>{
  },
  getters: <GetterTree<State, any>>{
    get_chat_log_for_room: (state: State) => (room_id: MatrixRoomID): ChatLog => {
      return {
        messages: []
      }
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
