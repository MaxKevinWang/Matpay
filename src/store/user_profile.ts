import { UserProfile } from '@/interface/UserProfile.interface'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import axios from 'axios'

interface State {
  user_profiles: Record<string, UserProfile>
}
export const user_profile_store = {
  namespaced: true,
  state () : State {
    return {
      user_profiles: {}
    }
  },
  mutations: <MutationTree<State>> {
    mutation_set_user_profile (
      state: State,
      payload: {
        user_id: string,
        user_profile: UserProfile
      }
    ) {
      state.user_profiles[payload.user_id] = payload.user_profile
    }
  },
  actions: <ActionTree<State, any>> {
    action_get_user_profile ({
      commit,
      rootGetters
    }, payload: {
      user_id : string
    }) {
      return new Promise((resolve, reject) => {
        const homeserver = rootGetters['auth/homeserver']
        axios.get<UserProfile>(`${homeserver}/_matrix/client/r0/profile/${payload.user_id}`)
          .then(response => {
            commit('mutation_set_user_profile', {
              user_id: payload.user_id,
              user_profile: response.data
            })
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    }
  },
  getters: <GetterTree<State, any>> {

  }
}
