import { GETJoinedRoomsResponse } from '@/interface/api.interface'
import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { MatrixError } from '@/interface/error.interface'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { Room } from '@/models/room.model'
import { TxRejectedEvent } from '@/interface/tx_event.interface'

interface State {
  joined_rooms: Room[],
  invited_rooms: Room[],
  processed_events: Set<MatrixEventID>
}

export const rooms_store = {
  namespaced: true,
  state (): State {
    return {
      joined_rooms: [],
      invited_rooms: [],
      processed_events: new Set()
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_rooms (state: State, payload: { joined_rooms_id: MatrixRoomID[] }) {
      state.joined_rooms = [] // reset to clean state
      for (const room_id of payload.joined_rooms_id) {
        const new_room: Room = {
          room_id: room_id,
          name: '',
          state_events: []
        }
        state.joined_rooms.push(new_room)
      }
    },
    mutation_set_state_event_for_joined_room (state: State,
      payload: { room_id: MatrixRoomID, state_events: MatrixRoomStateEvent[] }) {
      const rooms = state.joined_rooms.filter(r => r.room_id === payload.room_id)
      if (rooms.length === 0) {
        state.joined_rooms.push({
          room_id: payload.room_id,
          name: '',
          state_events: payload.state_events
        })
      } else {
        rooms[0].state_events = payload.state_events
      }
    },
    mutation_set_name_for_joined_room (state: State, payload: { room_id: MatrixRoomID, name: string }) {
      const rooms = state.joined_rooms.filter(r => r.room_id === payload.room_id)
      if (rooms.length === 0) {
        state.joined_rooms.push({
          room_id: payload.room_id,
          name: payload.name,
          state_events: []
        })
      } else {
        rooms[0].name = payload.name
      }
    },
    mutation_add_processed_event (state: State, payload: MatrixEventID) {
      state.processed_events.add(payload)
    }
  },
  actions: <ActionTree<State, any>>{
    async action_get_joined_rooms ({
      commit,
      rootGetters
    }): Promise<MatrixRoomID[]> {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.get<GETJoinedRoomsResponse>(`${homeserver}/_matrix/client/r0/joined_rooms`)
      commit('mutation_init_joined_rooms', { joined_rooms_id: response.data.joined_rooms })
      return response.data.joined_rooms
    },
    async action_get_all_joined_room_state_events ({
      state,
      commit,
      dispatch,
      getters,
      rootGetters
    }) {
      type RoomState = {
        room_id: MatrixRoomID,
        state_events: MatrixRoomStateEvent[]
      }
      const promises: Promise<void>[] = []
      for (const room of state.joined_rooms) {
        promises.push(async function () {
          const homeserver = rootGetters['auth/homeserver']
          const response = await axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${room.room_id}/state`)
          const result: RoomState = {
            room_id: room.room_id,
            state_events: response.data
          }
          commit('mutation_set_state_event_for_joined_room', result)
          // set name for every room
          const name_event = response.data.filter(e => e.type === 'm.room.name')
          if (name_event.length > 0) {
            commit('mutation_set_name_for_joined_room', {
              room_id: room.room_id,
              name: name_event[0].content.name
            })
          }
          // dispatch member parsing
          dispatch('user/action_parse_member_events_for_room', {
            room_id: room.room_id,
            member_events: getters.get_member_state_events_for_room(room.room_id),
            permission_event: getters.get_permission_event_for_room(room.room_id)
          }, { root: true })
        }())
      }
      return Promise.all(promises)
    },
    async action_get_room_state_events ({
      commit,
      dispatch,
      getters,
      rootGetters
    }, payload: { room_id: MatrixRoomID }) {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.get<MatrixRoomStateEvent[]>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/state`)
      const result = {
        room_id: payload.room_id,
        state_events: response.data
      }
      commit('mutation_set_state_event_for_joined_room', result)
      // set name for every room
      const name_event = response.data.filter(e => e.type === 'm.room.name')
      if (name_event.length > 0) {
        commit('mutation_set_name_for_joined_room', {
          room_id: payload.room_id,
          name: name_event[0].content.name
        })
      }
      // dispatch member parsing
      dispatch('user/action_parse_member_events_for_room', {
        room_id: payload.room_id,
        member_events: getters.get_member_state_events_for_room(payload.room_id),
        permission_event: getters.get_permission_event_for_room(payload.room_id)
      }, { root: true })
    }
  },
  getters: <GetterTree<State, any>>{
    get_all_joined_rooms: (state: State) => (): Room[] => {
      return state.joined_rooms
    },
    get_member_state_events_for_room: (state: State) => (room_id: MatrixRoomID): MatrixRoomMemberStateEvent[] => {
      const rooms = state.joined_rooms.filter(r => r.room_id === room_id)
      if (rooms.length !== 1) {
        throw new Error('Room does not exist!')
      }
      const events = rooms[0].state_events
      return events.filter(event => event.type === 'm.room.member') as MatrixRoomMemberStateEvent[]
    },
    get_permission_event_for_room: (state: State) => (room_id: MatrixRoomID): MatrixRoomStateEvent => {
      const rooms = state.joined_rooms.filter(r => r.room_id === room_id)
      if (rooms.length !== 1) {
        throw new Error('Room does not exist!')
      }
      const events = rooms[0].state_events
      return events.filter(event => event.type === 'm.room.power_levels')[0] as MatrixRoomStateEvent
    },
    get_rejected_events_for_room: (state: State) => (room_id: MatrixRoomID): TxRejectedEvent[] => {
      const rooms = state.joined_rooms.filter(r => r.room_id === room_id)
      if (rooms.length !== 1) {
        throw new Error('Room does not exist!')
      }
      const events = rooms[0].state_events
      return events.filter(event => event.type === 'com.matpay.rejected')[0] as unknown as TxRejectedEvent[]
    },
    get_room_name: (state: State) => (room_id: string): string | null => {
      const rooms = state.joined_rooms.filter(r => r.room_id === room_id)
      if (rooms.length !== 1) {
        throw new Error('Room does not exist!')
      }
      if (rooms[0].name !== '') {
        return rooms[0].name
      } else {
        return null
      }
    }
  }
}

// Testing
export default {
  state: rooms_store.state,
  mutations: rooms_store.mutations,
  actions: rooms_store.actions,
  getters: rooms_store.getters
}
