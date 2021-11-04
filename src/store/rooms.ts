import { GETJoinedRoomsResponse } from '@/interface/rooms.interface'
import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'

interface State {
  joined_rooms: string[]
}
export const rooms_store = {
  namespaced: true,
  state () : State {
    return {
      joined_rooms: []
    }
  },
  mutations: <MutationTree<State>>{
    mutation_set_jointed_rooms (state : State, payload : { joined_rooms: string[] }) {
      state.joined_rooms = payload.joined_rooms
    }
  },
  actions: <ActionTree<State, any>>{
    action_get_joined_rooms ({ commit, rootGetters }) : Promise<GETJoinedRoomsResponse> {
      return new Promise((resolve, reject) => {
        const homeserver = rootGetters['auth/homeserver']
        axios.get<GETJoinedRoomsResponse>(`${homeserver}/_matrix/client/r0/joined_rooms`)
          .then(response => {
            console.log(response)
            commit('mutation_set_jointed_rooms', { joined_rooms: response.data.joined_rooms })
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    action_get_room_states ({ commit, rootGetters }) {
      
    }
  },
  getters: <GetterTree<State, any>>{
  }
}
