import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { RoomUserInfo, User } from '@/models/user.model'
import {
  MatrixRoomMemberStateEvent,
  MatrixRoomPermissionConfiguration,
  MatrixRoomStateEvent
} from '@/interface/rooms_event.interface'
import { MatrixError } from '@/interface/error.interface'
import { cloneDeep } from 'lodash'

interface State {
  users_info: Record<MatrixRoomID, Array<RoomUserInfo>>,
  permissions: Record<MatrixRoomID, MatrixRoomPermissionConfiguration>
}

export const user_store = {
  namespaced: true,
  state (): State {
    return {
      users_info: {},
      permissions: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
      state.users_info[payload] = []
    },
    mutation_set_users_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      users_info: Array<RoomUserInfo>
    }) {
      state.users_info[payload.room_id] = cloneDeep(payload.users_info)
    },
    mutation_set_permission_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      permission: MatrixRoomPermissionConfiguration
    }) {
      state.permissions[payload.room_id] = cloneDeep(payload.permission)
    }
  },
  actions: <ActionTree<State, any>> {
    async action_parse_member_events_for_room ({
      state,
      commit,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      member_events: MatrixRoomMemberStateEvent[],
      permission_event: MatrixRoomStateEvent
    }) : Promise<Array<RoomUserInfo>> {
      const displayname_table : Record<string, string[]> = {}
      // set permission event
      commit('mutation_set_permission_for_room', {
        room_id: payload.room_id,
        permission: payload.permission_event.content as MatrixRoomPermissionConfiguration
      })
      let users_info_tmp : Array<RoomUserInfo> = []
      // extract users list from member events
      if (payload.member_events && payload.member_events.length > 0) {
        users_info_tmp = payload.member_events
          .filter(event => event.content.membership === 'join')
          .map(event => {
            return {
              user: {
                user_id: event.state_key,
                displayname: event.content.displayname || ''
              },
              displayname: '',
              avatar_url: event.content.avatar_url,
              user_type: 'Member',
              is_self: false,
              balance: 0
            }
          })
      }
      if (users_info_tmp.length === 0) {
        return []
      }
      // calculate display name according to Specification 13.2.2.3
      // 1. Construct hashtable displayname -> user ID
      for (const i of users_info_tmp) {
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
      const self_user_id = rootGetters['auth/user_id']
      const users_info : Array<RoomUserInfo> = []
      for (const [displayname, ids] of Object.entries(displayname_table)) {
        if (ids.length === 1) { // no collision
          const member_object = users_info_tmp.filter(i => i.user.user_id === ids[0])[0]
          users_info.push({
            user: member_object.user,
            displayname: displayname,
            avatar_url: member_object.avatar_url,
            is_self: ids[0] === self_user_id,
            user_type: state.permissions[payload.room_id].users[ids[0]] >= 100
              ? 'Admin'
              : state.permissions[payload.room_id].users[ids[0]] >= 50 ? 'Moderator' : 'Member',
            balance: 0 // open balance counting not done here
          })
        } else { // collision detected
          for (const repeated_id of ids) {
            const member_object = users_info_tmp.filter(i => i.user.user_id === repeated_id)[0]
            users_info.push({
              user: member_object.user,
              displayname: displayname + ' (' + repeated_id + ')',
              avatar_url: member_object.avatar_url,
              is_self: repeated_id === self_user_id,
              user_type: state.permissions[payload.room_id].users[repeated_id] >= 100
                ? 'Admin'
                : state.permissions[payload.room_id].users[repeated_id] >= 50 ? 'Moderator' : 'Member',
              balance: 0 // open balance counting not done here
            })
          }
        }
      }
      // 3. Save calculated user info
      commit('mutation_set_users_for_room', {
        room_id: payload.room_id,
        users_info: users_info
      })
      return users_info
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
    get_users_info_for_room: (state: State) => (room_id: MatrixRoomID) : Array<RoomUserInfo> => {
      return state.users_info[room_id]
    },
    get_permissions_for_room: (state: State) => (room_id: MatrixRoomID) : MatrixRoomPermissionConfiguration => {
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
