import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomID } from '@/models/id.model'
import { User } from '@/models/user.model'

interface State {
  users: Record<MatrixRoomID, Array<{
    user: User,
    displayname: string,
    is_admin: boolean,
    is_self: boolean,
    balance: number
  }>>
}

export const user_store = {
  namespaced: true,
  state (): State {
    return {
      users: {}
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
  state: user_store.state,
  mutations: user_store.mutations,
  actions: user_store.actions,
  getters: user_store.getters
}
