import { GETJoinedRoomsResponse } from '@/interface/rooms.interface'
import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomStateEvent } from '@/interface/event.interface'

interface State {
  joined_room_state_events: Record<string, MatrixRoomStateEvent[]>,
}

type RoomState = {
  room: string,
  state_event: MatrixRoomStateEvent[]
}
type RoomStatePromise = Promise<RoomState>
export const rooms_store = {
  namespaced: true,
  state (): State {
    return {
      joined_room_state_events: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_set_joined_rooms (state: State, payload: { joined_rooms: string[] }) {
      for (const room of payload.joined_rooms) {
        state.joined_room_state_events[room] = []
      }
    },
    mutation_set_state_event_for_joined_room (state: State,
      payload: { room: string, state_event: MatrixRoomStateEvent[] }) {
      state.joined_room_state_events[payload.room] = payload.state_event
    }
  },
  actions: <ActionTree<State, any>>{
    action_get_joined_rooms ({
      commit,
      rootGetters
    }): Promise<GETJoinedRoomsResponse> {
      return new Promise((resolve, reject) => {
        const homeserver = rootGetters['auth/homeserver']
        axios.get<GETJoinedRoomsResponse>(`${homeserver}/_matrix/client/r0/joined_rooms`)
          .then(response => {
            commit('mutation_set_joined_rooms', { joined_rooms: response.data.joined_rooms })
            resolve(response.data)
          })
          .catch(error => {
            reject(error)
          })
      })
    },
    action_get_joined_room_state_events ({
      state,
      commit,
      rootGetters
    }) {
      const promises: RoomStatePromise[] = []
      for (const room of Object.keys(state.joined_room_state_events)) {
        promises.push(new Promise((resolve, reject) => {
          const homeserver = rootGetters['auth/homeserver']
          axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${room}/state`)
            .then(response => {
              commit('mutation_set_state_event_for_joined_room', {
                room,
                state_event: response.data
              })
              resolve({
                room,
                state_event: response.data
              })
            })
            .catch(error => {
              reject(error)
            })
        }))
      }
      return Promise.all(promises)
    }
  },
  getters: <GetterTree<State, any>>{}
}
