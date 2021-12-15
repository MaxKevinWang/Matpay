import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomID } from '@/models/id.model'
import { ChatLog } from '@/models/chat.model'

interface State {
  chat_log: Record<MatrixRoomID, ChatLog>
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {}
    }
  },
  mutations: <MutationTree<State>>{
  },
  actions: <ActionTree<State, any>>{
  },
  getters: <GetterTree<State, any>>{
  }
}

// Testing
export default {
  state: chat_store.state,
  mutations: chat_store.mutations,
  actions: chat_store.actions,
  getters: chat_store.getters
}
