import store from '@/store/user'
import { RoomUserInfo } from '@/models/user.model'
import { MatrixRoomID, MatrixUserID } from '@/models/id.model'
import {
  MatrixRoomMemberStateEvent,
  MatrixRoomPermissionConfiguration, MatrixRoomStateEvent
} from '@/interface/rooms_event.interface'
import {
  room_01_user_info,
  room_01_left_user_info,
  room_01_permission,
  room_01_room_id,
  user_1,
  user_2,
  user_3,
  user_aaa
} from '../mocks/mocked_user'
import axios from 'axios'
import { cloneDeep } from 'lodash'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

interface State {
  users_info: Record<MatrixRoomID, Array<RoomUserInfo>>,
  permissions: Record<MatrixRoomID, MatrixRoomPermissionConfiguration>,
  left_users_info: Record<MatrixRoomID, Array<RoomUserInfo>>
}

describe('Test user store', function () {
  const room_id = 'ABC'
  let state: State = {
    users_info: {
      ABC: []
    },
    permissions: {
      ABC: {
        ban: 0,
        events: {},
        events_default: 0,
        invite: 0,
        kick: 0,
        redact: 0,
        state_default: 0,
        users_default: 0,
        users: {}
      }
    },
    left_users_info: {
      ABC: []
    }
  }
  describe('Test store mutation', function () {
    beforeEach(() => {
      state = { // clear mocks
        users_info: {
          ABC: []
        },
        permissions: {
          ABC: {
            ban: 0,
            events: {},
            events_default: 0,
            invite: 0,
            kick: 0,
            redact: 0,
            state_default: 0,
            users_default: 0,
            users: {}
          }
        },
        left_users_info: {
          ABC: []
        }
      }
    })
    it('Test mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      mutation(state, 'ABC')
      expect(state.users_info).toEqual({ ABC: [] })
    })
    it('Test mutation_set_users_for_room', function () {
      const mutation = store.mutations.mutation_set_users_for_room
      mutation(state, {
        room_id: room_id,
        users_info: cloneDeep(room_01_user_info)
      })
      expect(state.users_info[room_id]).toEqual(room_01_user_info)
    })
    it('Test mutation_set_permission_for_room', function () {
      const mutation = store.mutations.mutation_set_permission_for_room
      mutation(state, {
        room_id: room_id,
        permission: room_01_permission
      })
      expect(state.permissions[room_id]).toEqual(room_01_permission)
    })
    it('Test mutation_reset_state', function () {
      const mutation = store.mutations.mutation_reset_state
      state.users_info[room_id] = cloneDeep(room_01_user_info)
      state.permissions[room_id] = cloneDeep(room_01_permission)
      mutation(state)
      expect(state.users_info).toEqual({})
      expect(state.permissions).toEqual({})
    })
    it('Test mutation_remove_joined_room', function () {
      const mutation = store.mutations.mutation_remove_joined_room
      state.users_info[room_id] = cloneDeep(room_01_user_info)
      state.permissions[room_id] = cloneDeep(room_01_permission)
      state.left_users_info[room_id] = cloneDeep(room_01_left_user_info)
      mutation(state, room_id)
      expect(state.users_info[room_id]).toEqual(undefined)
      expect(state.permissions[room_id]).toEqual(undefined)
      expect(state.left_users_info[room_id]).toEqual(undefined)
    })
    it('Test mutation_add_user_for_room', function () {
      const mutation = store.mutations.mutation_add_user_for_room
      state.users_info[room_id] = cloneDeep(room_01_user_info)
      mutation(state, {
        room_id: room_id,
        user_info: {
          user: {
            user_id: 'jkf',
            displayname: 'Xuyang Hou'
          },
          displayname: 'Schuh Young',
          is_self: false,
          user_type: 'Member'
        }
      })
      expect(state.users_info[room_id]).toBeArrayOfSize(4)
    })
    it('Test mutation_add_left_user_for_room', function () {
      const mutation = store.mutations.mutation_add_left_user_for_room
      state.left_users_info[room_id] = cloneDeep(room_01_left_user_info)
      mutation(state, {
        room_id: room_id,
        left_user_info: {
          user: {
            user_id: 'jkf',
            displayname: 'Xuyang Hou'
          },
          displayname: 'Schuh Young',
          is_self: false,
          user_type: 'Member'
        }
      })
      expect(state.left_users_info[room_id]).toBeArrayOfSize(2)
    })
    it('Test mutation_remove_joined_and_left_user_for_room', function () {
      const mutation = store.mutations.mutation_remove_joined_and_left_user_for_room
      state.left_users_info[room_id] = cloneDeep(room_01_left_user_info)
      state.users_info[room_id] = cloneDeep(room_01_user_info)
      mutation(state, {
        room_id: room_id,
        user_id: user_aaa.user_id
      })
      mutation(state, {
        room_id: room_id,
        user_id: user_1.user_id
      })
      expect(state.users_info[room_id]).toEqual([{
        user: user_3,
        displayname: 'DSN Test Account No 3',
        is_self: false,
        user_type: 'Admin'
      }, {
        user: user_2,
        avatar_url: '',
        displayname: 'DSN Test Account No 2',
        is_self: false,
        user_type: 'Member'
      }])
      expect(state.left_users_info[room_id]).toEqual([])
    })
    it('Test mutation_recalculate_joined_user_display_name_for_room', function () {
      const mutation = store.mutations.mutation_recalculate_joined_user_display_name_for_room
      state.users_info[room_id] = [{
        user: {
          user_id: user_1.user_id,
          displayname: ''
        },
        displayname: 'DSN Test Account No 1',
        avatar_url: '',
        is_self: true,
        user_type: 'Member'
      },
      {
        user: {
          user_id: user_2.user_id,
          displayname: 'Rocky Balboa'
        },
        displayname: 'Rocky Balboa',
        avatar_url: '',
        is_self: false,
        user_type: 'Member'
      },
      {
        user: {
          user_id: user_3.user_id,
          displayname: 'Rocky Balboa'
        },
        displayname: 'Rocky Balboa',
        avatar_url: '',
        is_self: false,
        user_type: 'Admin'
      }]
      mutation(state, room_id)
      expect(state.users_info[room_id][0].displayname).toEqual('DSN Test Account No 1')
      expect(state.users_info[room_id][1].displayname).toEqual('Rocky Balboa (@test-2:dsn.tm.kit.edu)')
      expect(state.users_info[room_id][2].displayname).toEqual('Rocky Balboa (@test-3:dsn.tm.kit.edu)')
    })
  })
  describe('Test store actions', function () {
    beforeEach(() => {
      state = { // clear mocks
        users_info: {
          ABC: []
        },
        permissions: {
          ABC: {
            ban: 0,
            events: {},
            events_default: 0,
            invite: 0,
            kick: 0,
            redact: 0,
            state_default: 0,
            users_default: 0,
            users: {}
          }
        },
        left_users_info: {
          ABC: []
        }
      }
    })
    describe('Test action_parse_member_events_for_room', function () {
      const action_parse_member = store.actions.action_parse_member_events_for_room as (context: any, payload: any) => Promise<Array<RoomUserInfo>>
      it('Test commits and dispatches have been called successfully', async () => {
        const member_events: MatrixRoomMemberStateEvent[] = [{
          type: 'm.room.member',
          content: {
            avatar_url: '',
            displayname: 'DSN Test Account No 1',
            membership: 'join'
          },
          state_key: '@test-1:dsn.tm.kit.edu',
          room_id: room_id,
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: ''
        }, {
          type: 'm.room.member',
          content: {
            avatar_url: '',
            displayname: '',
            membership: 'join'
          },
          state_key: '@test-2:dsn.tm.kit.edu',
          room_id: room_id,
          sender: user_2.user_id,
          origin_server_ts: 0,
          event_id: ''
        }]
        let mutation_1_called = false
        let mutation_2_called = false
        const commit = (type: string, payload: {
          room_id: MatrixRoomID
        }) => {
          if (type === 'mutation_init_joined_room') {
            mutation_1_called = true
          } else if (type === 'mutation_recalculate_joined_user_display_name_for_room') {
            mutation_2_called = true
          }
        }
        let dispatch_called = 0
        const dispatch = async (action_string: string, payload: {
          room_id: MatrixRoomID,
          memberEvent: MatrixRoomMemberStateEvent,
          recalculate_displayname: false
        }) => {
          dispatch_called++
        }
        await action_parse_member({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: jest.fn()
        }, {
          room_id: room_id,
          member_events: member_events
        })
        await expect(mutation_1_called).toBe(true)
        await expect(mutation_2_called).toBe(true)
        await expect(dispatch_called).toBe(2)
      })
    })
    describe('Test action_parse_single_member_event_for_room', function () {
      const actions_parse_single_member_event = store.actions.action_parse_single_member_event_for_room as (context: any, payload: any) => Promise<RoomUserInfo | null>
      const rootGetters = {
        'auth/homeserver': '!ghjfghkdk:dsn.scc.kit.edu',
        'auth/user_id': '@test-1:dsn.tm.kit.edu'
      }
      const state = {
        permissions: {
          ABC: cloneDeep(room_01_permission)
        }
      }
      it('Tests Membership = join', async () => {
        const member_event: MatrixRoomMemberStateEvent = {
          type: 'm.room.member',
          content: {
            avatar_url: '',
            displayname: 'DSN Test Account No 1',
            membership: 'join'
          },
          state_key: '@test-1:dsn.tm.kit.edu',
          room_id: room_id,
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: ''
        }
        let mutation_1_called = false
        let mutation_2_called = false
        const commit = (type: string, payload: {
          room_id: MatrixRoomID,
          user_id?: MatrixUserID,
          user_info?: RoomUserInfo
        }) => {
          if (type === 'mutation_remove_joined_and_left_user_for_room') {
            mutation_1_called = true
          } else if (type === 'mutation_add_user_for_room') {
            mutation_2_called = true
          }
        }
        await expect(actions_parse_single_member_event({
          state,
          commit: commit,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          member_event: member_event,
          recalculate_displayname: false
        })).resolves.toEqual({
          user: {
            user_id: '@test-1:dsn.tm.kit.edu',
            displayname: 'DSN Test Account No 1'
          },
          displayname: 'DSN Test Account No 1',
          avatar_url: '',
          user_type: 'Member',
          is_self: true
        })
        await expect(mutation_1_called).toBe(true)
        await expect(mutation_2_called).toBe(true)
      })
      it('Test Membership = leave', async () => {
        const member_event: MatrixRoomMemberStateEvent = {
          type: 'm.room.member',
          content: {
            avatar_url: '',
            displayname: 'DSN Test Account No 1',
            membership: 'leave'
          },
          state_key: '@test-1:dsn.tm.kit.edu',
          room_id: room_id,
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: ''
        }
        let mutation_1_called = false
        let mutation_2_called = false
        const commit = (type: string, payload: {
          room_id: MatrixRoomID,
          user_id?: MatrixUserID,
          user_info?: RoomUserInfo
        }) => {
          if (type === 'mutation_remove_joined_and_left_user_for_room') {
            mutation_1_called = true
          } else if (type === 'mutation_add_left_user_for_room') {
            mutation_2_called = true
          }
        }
        await expect(actions_parse_single_member_event({
          state,
          commit: commit,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          member_event: member_event,
          recalculate_displayname: false
        })).resolves.toEqual({
          user: {
            user_id: '@test-1:dsn.tm.kit.edu',
            displayname: 'DSN Test Account No 1 (Left)'
          },
          displayname: 'DSN Test Account No 1 (Left)',
          avatar_url: '',
          user_type: 'Left',
          is_self: false
        })
        await expect(mutation_1_called).toBe(true)
        await expect(mutation_2_called).toBe(true)
      })
      it('Recalculate Balance is true', async () => {
        const member_event: MatrixRoomMemberStateEvent = {
          type: 'm.room.member',
          content: {
            avatar_url: '',
            displayname: 'DSN Test Account No 1',
            membership: 'leave'
          },
          state_key: '@test-1:dsn.tm.kit.edu',
          room_id: room_id,
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: ''
        }
        let mutation_recalculate_joined_user_display_name_for_room_called = false
        const commit = (type: string, payload: {
          room_id: MatrixRoomID,
          user_id?: MatrixUserID,
          user_info?: RoomUserInfo
        }) => {
          if (type === 'mutation_recalculate_joined_user_display_name_for_room') {
            mutation_recalculate_joined_user_display_name_for_room_called = true
          }
        }
        await actions_parse_single_member_event({
          state,
          commit: commit,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          member_event: member_event,
          recalculate_displayname: true
        })
        await expect(mutation_recalculate_joined_user_display_name_for_room_called).toBe(true)
      })
    })
    describe('Test action_change_user_membership_on_room', function () {
      const action_change_memb = store.actions.action_change_user_membership_on_room as (context: any, payload: any) => Promise<boolean>
      it('Test 400 response', async () => {
        const response = {
          status: 400,
          data: {
            errcode: 'M_UNKNOWN',
            error: 'An unknown error occurred'
          }
        }
        mockedAxios.post.mockResolvedValue(response)
        await expect(() => action_change_memb({
          dispatch: jest.fn(),
          rootGetters: jest.fn()
        }, {
          room_id: room_01_room_id,
          user_id: user_1.user_id,
          action: 'invite'
        })).rejects.toThrow(response.data.error)
      })
    })
    describe('Test action_parse_permission_event_for_room', function () {
      const action_parse_permission = store.actions.action_parse_permission_event_for_room as (context: any, payload: any) => Promise<MatrixRoomPermissionConfiguration>
      it('Test permission event is set properly', async () => {
        let commit_called = false
        const commit = (mutation_string: string, payload: {
          room_id: MatrixRoomID,
          permission: MatrixRoomStateEvent
        }) => {
          commit_called = true
        }
        await action_parse_permission({
          state,
          commit: commit,
          rootGetters: jest.fn()
        }, {
          room_id: room_id,
          permission_event: {
            state_key: 'test_key',
            room_id: 'abc',
            sender: user_1.user_id,
            origin_server_ts: 0,
            event_id: 'test_event',
            content: {
              ban: 50,
              events: {},
              events_default: 50,
              invite: 100,
              kick: 100,
              redact: 50,
              state_default: 50,
              users_default: 50,
              users: {}
            },
            type: 'm.room.power_levels'
          }
        })
        await expect(commit_called).toBe(true)
      })
    })
  })
  describe('Test store getters', function () {
    beforeEach(() => {
      state = { // clear mocks
        users_info: {
          ABC: []
        },
        permissions: {
          ABC: {
            ban: 0,
            events: {},
            events_default: 0,
            invite: 0,
            kick: 0,
            redact: 0,
            state_default: 0,
            users_default: 0,
            users: {}
          }
        },
        left_users_info: {
          ABC: []
        }
      }
    })
    it('Test get_users_info_for_room', function () {
      const getter = store.getters.get_users_info_for_room(state, null, null, null)
      state.users_info[room_id] = room_01_user_info
      expect(getter(room_id)).toEqual(room_01_user_info)
    })
    it('Test get_permissions_for_room', function () {
      const getter = store.getters.get_permissions_for_room(state, null, null, null)
      state.permissions[room_id] = room_01_permission
      expect(getter(room_id)).toEqual(room_01_permission)
    })
    it('Test get_left_users_info_for_room', function () {
      const getter = store.getters.get_left_users_info_for_room(state, null, null, null)
      state.left_users_info[room_id] = room_01_left_user_info
      expect(getter(room_id)).toEqual(room_01_left_user_info)
    })
    it('Test get_all_users_info_for_room', function () {
      const getter = store.getters.get_all_users_info_for_room(state, null, null, null)
      state.left_users_info[room_id] = room_01_left_user_info
      state.users_info[room_id] = room_01_user_info
      expect(getter(room_id)).toEqual([{
        user: user_1,
        displayname: 'DSN Test Account No 1',
        avatar_url: '',
        is_self: true,
        user_type: 'Member'
      }, {
        user: user_3,
        displayname: 'DSN Test Account No 3',
        is_self: false,
        user_type: 'Admin'
      }, {
        user: user_2,
        avatar_url: '',
        displayname: 'DSN Test Account No 2',
        is_self: false,
        user_type: 'Member'
      }, {
        user: user_aaa,
        displayname: 'DSN Test Account No aaa',
        is_self: false,
        user_type: 'Member'
      }])
    })
  })
})
