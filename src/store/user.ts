import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { RoomUserInfo } from '@/models/user.model'
import {
  MatrixRoomMemberStateEvent,
  MatrixRoomPermissionConfiguration,
  MatrixRoomStateEvent
} from '@/interface/rooms_event.interface'
import { MatrixError } from '@/interface/error.interface'
import { cloneDeep } from 'lodash'

interface State {
  users_info: Record<MatrixRoomID, Array<RoomUserInfo>>,
  permissions: Record<MatrixRoomID, MatrixRoomPermissionConfiguration>,
  left_users_info: Record<MatrixRoomID, Array<RoomUserInfo>>
}

export const user_store = {
  namespaced: true,
  state (): State {
    return {
      users_info: {},
      permissions: {},
      left_users_info: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
      state.users_info[payload] = []
      state.left_users_info[payload] = []
    },
    mutation_set_users_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      users_info: Array<RoomUserInfo>
    }) {
      state.users_info[payload.room_id] = cloneDeep(payload.users_info)
    },
    mutation_add_user_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      user_info: RoomUserInfo
    }) {
      state.users_info[payload.room_id].push(cloneDeep(payload.user_info))
    },
    mutation_add_left_user_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      left_user_info: RoomUserInfo
    }) {
      state.left_users_info[payload.room_id].push(cloneDeep(payload.left_user_info))
    },
    mutation_remove_joined_and_left_user_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      user_id: MatrixUserID
    }) {
      const room_id = payload.room_id
      const user_id = payload.user_id
      // Remove all previous member events
      const previous_joined_index = state.users_info[room_id].findIndex(i => i.user.user_id === user_id)
      if (previous_joined_index > -1) {
        state.users_info[room_id].splice(previous_joined_index, 1)
      }
      const previous_left_index = state.left_users_info[room_id].findIndex(i => i.user.user_id === user_id)
      if (previous_left_index > -1) {
        state.left_users_info[room_id].splice(previous_left_index, 1)
      }
    },
    mutation_set_permission_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      permission: MatrixRoomPermissionConfiguration
    }) {
      state.permissions[payload.room_id] = cloneDeep(payload.permission)
    },
    mutation_reset_state (state: State) {
      Object.assign(state, {
        users_info: {},
        permissions: {},
        left_users_info: {}
      })
    },
    mutation_recalculate_joined_user_display_name_for_room (state: State, payload: MatrixRoomID) {
      // calculate display name according to Specification 13.2.2.3
      // 1. Construct hashtable displayname -> user ID
      const displayname_table: Record<string, MatrixUserID[]> = {}
      for (const i of state.users_info[payload]) {
        if (i.user.displayname === '') {
          if (!displayname_table[i.user.user_id]) {
            displayname_table[i.user.user_id] = []
          }
          displayname_table[i.user.user_id].push(i.user.user_id)
        } else {
          if (!displayname_table[i.user.displayname]) {
            displayname_table[i.user.displayname] = []
          }
          displayname_table[i.user.displayname].push(i.user.user_id)
        }
      }
      // 2. Resolve displayname collisions
      for (const [displayname, ids] of Object.entries(displayname_table)) {
        if (ids.length > 1) { // no collision// collision detected
          for (const repeated_id of ids) {
            state.users_info[payload]
              .filter(i => i.user.user_id === repeated_id)[0]
              .displayname = displayname + ' (' + repeated_id + ')'
          }
        }
      }
    }
  },
  actions: <ActionTree<State, any>>{
    async action_parse_permission_event_for_room ({
      state,
      commit,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      permission_event: MatrixRoomStateEvent
    }): Promise<MatrixRoomPermissionConfiguration> {
      // set permission event
      commit('mutation_set_permission_for_room', {
        room_id: payload.room_id,
        permission: payload.permission_event.content as MatrixRoomPermissionConfiguration
      })
      return state.permissions[payload.room_id]
    },
    // Note: this action assumes the correct permission event has been set.
    async action_parse_single_member_event_for_room ({
      state,
      commit,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      member_event: MatrixRoomMemberStateEvent,
      recalculate_displayname: boolean
    }): Promise<RoomUserInfo | null> {
      const room_id = payload.room_id
      const permissions = state.permissions[room_id]
      const member_event = payload.member_event
      const self_user_id = rootGetters['auth/user_id']
      let result : RoomUserInfo | null = null
      // Case 1: member joined
      if (member_event.content.membership === 'join') {
        const user_info_tmp: RoomUserInfo = {
          user: {
            user_id: member_event.state_key,
            displayname: member_event.content.displayname || ''
          },
          displayname: member_event.content.displayname || '',
          avatar_url: member_event.content.avatar_url,
          user_type: permissions.users[member_event.state_key] >= 100
            ? 'Admin'
            : permissions.users[member_event.state_key] >= 50 ? 'Moderator' : 'Member',
          is_self: member_event.state_key === self_user_id
        }
        // Remove previous user infos
        commit('mutation_remove_joined_and_left_user_for_room', {
          room_id: room_id,
          user_id: member_event.state_key
        })
        commit('mutation_add_user_for_room', {
          room_id: room_id,
          user_info: user_info_tmp
        })
        result = user_info_tmp
      } else if (member_event.content.membership === 'leave') {
        // Case 2: member left
        const user_info_tmp: RoomUserInfo = {
          user: {
            user_id: member_event.state_key,
            displayname: member_event.content.displayname || ''
          },
          displayname: member_event.content.displayname || '',
          avatar_url: member_event.content.avatar_url,
          user_type: 'Member',
          is_self: false
        }
        // Remove previous user infos
        commit('mutation_remove_joined_and_left_user_for_room', {
          room_id: room_id,
          user_id: member_event.state_key
        })
        commit('mutation_add_left_user_for_room', {
          room_id: room_id,
          left_user_info: user_info_tmp
        })
        result = user_info_tmp
      } // Other types are ignored here
      if (payload.recalculate_displayname) {
        commit('mutation_recalculate_joined_user_display_name_for_room', room_id)
      }
      return result
    },
    // Note: this action assumes the correct permission event has been set.
    // Note: this action removes all previous user information.
    async action_parse_member_events_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      member_events: MatrixRoomMemberStateEvent[]
    }): Promise<Array<RoomUserInfo>> {
      // clear existing user information
      commit('mutation_init_joined_room', payload.room_id)
      await Promise.all(payload.member_events.map(e => {
        return dispatch('action_parse_single_member_event_for_room', {
          room_id: payload.room_id,
          member_event: e,
          recalculate_displayname: false
        })
      }))
      commit('mutation_recalculate_joined_user_display_name_for_room', payload.room_id)
      return state.users_info[payload.room_id]
    },
    async action_change_user_membership_on_room ({
      dispatch,
      rootGetters
    }, payload: { room_id: MatrixRoomID, user_id: MatrixUserID, action: 'invite' | 'kick' | 'ban' | 'unban' }) {
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.post<Record<string, never>>(`${homeserver}/_matrix/client/r0/rooms/${payload.room_id}/${payload.action}`, {
        user_id: payload.user_id
      }, { validateStatus: () => true })
      if (response.status === 200) {
        dispatch('sync/action_update_state', null, { root: true }) // update state events
      } else {
        throw new Error((response.data as unknown as MatrixError).error)
      }
    }
  },
  getters: <GetterTree<State, any>>{
    get_users_info_for_room: (state: State) => (room_id: MatrixRoomID): Array<RoomUserInfo> => {
      return state.users_info[room_id]
    },
    get_left_users_info_for_room: (state: State) => (room_id: MatrixRoomID): Array<RoomUserInfo> => {
      return state.left_users_info[room_id]
    },
    get_permissions_for_room: (state: State) => (room_id: MatrixRoomID): MatrixRoomPermissionConfiguration => {
      return state.permissions[room_id]
    }
  }
}

// Testing
export default {
  state: user_store.state,
  mutations: user_store.mutations,
  actions: user_store.actions,
  getters: user_store.getters
}
