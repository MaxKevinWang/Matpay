import { GETJoinedRoomsResponse, POSTRoomCreateResponse } from '@/interface/api.interface'
import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { MatrixError } from '@/interface/error.interface'
import { MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { Room } from '@/models/room.model'
import { TxRejectedEvent } from '@/interface/tx_event.interface'
import { MatrixSyncInvitedRooms } from '@/interface/sync.interface'

interface State {
  joined_rooms: Room[],
  invited_rooms: Room[]
}

export const rooms_store = {
  namespaced: true,
  state (): State {
    return {
      joined_rooms: [],
      invited_rooms: []
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
      const new_room: Room = {
        room_id: payload,
        name: '',
        state_events: []
      }
      state.joined_rooms.push(new_room)
    },
    mutation_add_invited_room (state: State, payload: {
      room_id: MatrixRoomID,
      name: string
    }) {
      const new_room: Room = {
        room_id: payload.room_id,
        name: payload.name,
        state_events: []
      }
      state.invited_rooms.push(new_room)
    },
    mutation_add_state_event_for_joined_room (state: State,
      payload: { room_id: MatrixRoomID, state_event: MatrixRoomStateEvent }) {
      const room = state.joined_rooms.filter(r => r.room_id === payload.room_id)[0]
      const previous_state_event = room.state_events.filter(
        i => i.state_key === payload.state_event.state_key &&
          i.type === payload.state_event.type &&
          i.origin_server_ts < payload.state_event.origin_server_ts
      )
      for (const prev of previous_state_event) {
        const index = room.state_events.indexOf(prev)
        room.state_events.splice(index, 1)
      }
      room.state_events.push(payload.state_event)
    },
    mutation_set_name_for_joined_room (state: State, payload: { room_id: MatrixRoomID, name: string }) {
      const rooms = state.joined_rooms.filter(r => r.room_id === payload.room_id)
      rooms[0].name = payload.name
    },
    mutation_remove_invite_room (state: State, payload: {room_id: MatrixRoomID}) {
      state.invited_rooms = state.invited_rooms.filter(i => i.room_id !== payload.room_id)
    },
    mutation_reset_state (state: State) {
      Object.assign(state, {
        joined_rooms: [],
        invited_rooms: []
      })
    }
  },
  actions: <ActionTree<State, any>>{
    async action_parse_state_events_for_all_rooms ({
      state,
      commit,
      dispatch,
      getters,
      rootGetters
    }) {
      for (const room of state.joined_rooms) {
        const name_event = getters.get_name_event_for_room(room.room_id)
        if (name_event) {
          commit('mutation_set_name_for_joined_room', {
            room_id: room.room_id,
            name: name_event.content.name
          })
        }
        dispatch('user/action_parse_member_events_for_room', {
          room_id: room.room_id,
          member_events: getters.get_member_state_events_for_room(room.room_id),
          permission_event: getters.get_permission_event_for_room(room.room_id)
        }, { root: true })
      }
    },
    action_parse_invited_rooms ({
      state,
      commit,
      dispatch,
      getters,
      rootGetters
    }, payload: MatrixSyncInvitedRooms) {
      for (const [room_id, invite_state] of Object.entries(payload)) {
        let room_name = ''
        const name_events = invite_state.invite_state.events.filter(i => i.type === 'm.room.name')
        if (name_events.length > 0) {
          room_name = (name_events[0] as MatrixRoomStateEvent).content.name as string
        }
        commit('mutation_add_invited_room', {
          room_id: room_id,
          name: room_name
        })
      }
    },
    // Room creation action
    // This action does not create store structures for the room, nor fetches events after creation.
    async action_create_room ({
      state,
      commit,
      dispatch,
      getters,
      rootGetters
    }, payload: {
      room_name: string
    }) : Promise<MatrixRoomID> {
      if (!payload.room_name) {
        throw new Error('Room name cannot be empty!')
      }
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.post<POSTRoomCreateResponse>(`${homeserver}/_matrix/client/r0/createRoom`, {
        preset: 'private_chat',
        name: payload.room_name,
        initial_state: [
          {
            type: 'm.room.guest_access',
            state_key: '',
            content: {
              guest_access: 'forbidden'
            }
          }
        ]
      }, { validateStatus: () => true })
      if (response.status !== 200) {
        throw new Error((response.data as unknown as MatrixError).error)
      }
      // Resync joined rooms
      await dispatch('sync/action_resync_initial_state_for_room', {
        room_id: response.data.room_id
      }, { root: true })
      return response.data.room_id
    },
    async action_accept_invitation_for_room ({
      state,
      commit,
      dispatch,
      getters,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.post<POSTRoomCreateResponse>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/join`,
        null,
        { validateStatus: () => true })
      if (response.status !== 200) {
        throw new Error((response.data as unknown as MatrixError).error)
      }
      // Resync joined rooms
      await dispatch('sync/action_resync_initial_state_for_room', {
        room_id: payload.room_id
      }, { root: true })
      // remove invitation from state
      commit('mutation_remove_invite_room', payload.room_id)
    },
    async action_reject_invitation_for_room ({
      state,
      commit,
      dispatch,
      getters,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.post<Record<string, never>>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/leave`,
        null,
        { validateStatus: () => true })
      if (response.status !== 200) {
        throw new Error((response.data as unknown as MatrixError).error)
      }
      // remove invitation from state
      commit('mutation_remove_invite_room', payload.room_id)
    }
  },
  getters: <GetterTree<State, any>>{
    get_all_joined_rooms: (state: State) => (): Room[] => {
      return state.joined_rooms
    },
    get_invited_rooms: (state: State) => (): Room[] => {
      return state.invited_rooms
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
      return events.filter(event => event.type === 'm.room.power_levels')[0]
    },
    get_name_event_for_room: (state: State) => (room_id: MatrixRoomID): MatrixRoomStateEvent | undefined => {
      const rooms = state.joined_rooms.filter(r => r.room_id === room_id)
      if (rooms.length !== 1) {
        throw new Error('Room does not exist!')
      }
      const events = rooms[0].state_events
      return events.filter(event => event.type === 'm.room.name')[0] || undefined
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
