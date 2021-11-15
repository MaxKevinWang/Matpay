import { GETJoinedRoomsResponse } from '@/interface/rooms_api.interface'
import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import {
  MatrixRoomMemberStateEvent,
  MatrixRoomPermissionConfiguration,
  MatrixRoomStateEvent
} from '@/interface/rooms_event.interface'
import { MatrixError } from '@/interface/MatrixError.interface'

interface State {
  room_state_events: Record<string, MatrixRoomStateEvent[]>,
}

type RoomState = {
  room_id: string,
  state_event: MatrixRoomStateEvent[]
}
export const rooms_store = {
  namespaced: true,
  state (): State {
    return {
      room_state_events: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_set_joined_rooms (state: State, payload: { joined_rooms: string[] }) {
      state.room_state_events = {} // clear state before setting new rooms
      for (const room of payload.joined_rooms) {
        state.room_state_events[room] = []
      }
    },
    mutation_set_state_event_for_joined_room (state: State,
      payload: { room_id: string, state_event: MatrixRoomStateEvent[] }) {
      state.room_state_events[payload.room_id] = payload.state_event
    }
  },
  actions: <ActionTree<State, any>>{
    async action_get_joined_rooms ({
      commit,
      rootGetters
    }): Promise<GETJoinedRoomsResponse> {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.get<GETJoinedRoomsResponse>(`${homeserver}/_matrix/client/r0/joined_rooms`)
      commit('mutation_set_joined_rooms', { joined_rooms: response.data.joined_rooms })
      return response.data
    },
    async action_get_all_joined_room_state_events ({
      state,
      commit,
      rootGetters
    }) {
      const promises: Promise<RoomState>[] = []
      for (const room of Object.keys(state.room_state_events)) {
        promises.push(async function () {
          const homeserver = rootGetters['auth/homeserver']
          const response = await axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${room}/state`)
          const result: RoomState = {
            room_id: room,
            state_event: response.data
          }
          commit('mutation_set_state_event_for_joined_room', result)
          return result
        }())
      }
      return Promise.all(promises)
    },
    async action_get_room_state_events ({
      commit,
      rootGetters
    }, payload: { room_id: string }) {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/state`)
      const result = {
        room_id: payload.room_id,
        state_event: response.data
      }
      commit('mutation_set_state_event_for_joined_room', result)
      return result
    },
    async action_change_user_membership_on_room ({
      dispatch,
      rootGetters
    }, payload: { room_id: string, user_id: string, action: 'invite' | 'kick' | 'ban' | 'unban' }) {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.post<Record<string, never>>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/${payload.action}`, {
        user_id: payload.user_id
      }, { validateStatus: () => true })
      if (response.status === 200) {
        dispatch('action_get_room_state_events', { room_id: payload.room_id }) // update state events
        return response.data
      } else {
        throw new Error((response.data as unknown as MatrixError).error)
      }
    }
  },
  getters: <GetterTree<State, any>>{
    get_member_state_events_for_room: (state: State) => (room_id: string): MatrixRoomMemberStateEvent[] | null => {
      const events = state.room_state_events[room_id]
      if (events) {
        return events.filter(event => event.type === 'm.room.member') as MatrixRoomMemberStateEvent[]
      } else {
        return null
      }
    },
    get_room_name: (state: State) => (room_id: string): string | null => {
      const events = state.room_state_events[room_id]
      if (events) {
        const name_event = events.find(event => event.type === 'm.room.name')
        if (name_event) {
          return name_event.content.name as string
        } else {
          return null
        }
      } else {
        return null
      }
    },
    get_room_permissions: (state: State) => (room_id: string): MatrixRoomPermissionConfiguration | null => {
      const events = state.room_state_events[room_id]
      if (events) {
        const permission_event = events.find(event => event.type === 'm.room.power_levels')
        if (permission_event) {
          return permission_event.content as MatrixRoomPermissionConfiguration
        }
      }
      return null
    }
  }
}
