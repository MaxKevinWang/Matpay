import store from '@/store/user'
import { RoomUserInfo } from '@/models/user.model'
import { MatrixRoomID } from '@/models/id.model'
import { MatrixRoomMemberStateEvent, MatrixRoomPermissionConfiguration } from '@/interface/rooms_event.interface'
import {
  room_01_left_user_info,
  room_01_permission,
  room_01_room_id,
  room_01_user_info,
  user_1,
  user_2, user_3, user_aaa
} from '../mocks/mocked_user'
import axios from 'axios'

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
        users_info: room_01_user_info
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
      state.users_info[room_id] = room_01_user_info
      state.permissions[room_id] = room_01_permission
      mutation(state)
      expect(state.users_info).toEqual({})
      expect(state.permissions).toEqual({})
    })
    it('Test mutation_remove_joined_room', function () {
      const mutation = store.mutations.mutation_remove_joined_room
      state.users_info[room_id] = room_01_user_info
      state.permissions[room_id] = room_01_permission
      state.left_users_info[room_id] = room_01_left_user_info
      mutation(state, room_id)
      expect(state.users_info[room_id]).toEqual(undefined)
      expect(state.permissions[room_id]).toEqual(undefined)
      expect(state.left_users_info[room_id]).toEqual(undefined)
    })
    it('Test mutation_add_user_for_room', function () {
      const mutation = store.mutations.mutation_add_user_for_room
      state.users_info[room_id] = room_01_user_info
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
      state.left_users_info[room_id] = room_01_left_user_info
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
      state.left_users_info[room_id] = room_01_left_user_info
      state.users_info[room_id] = room_01_user_info
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
    const action_parse_member = store.actions.action_parse_member_events_for_room as (context: any, payload: any) => Promise<Array<RoomUserInfo>>
    const rootGetters = {
      'auth/homeserver': '!ghjfghkdk:dsn.scc.kit.edu',
      'auth/user_id': '@test-1:dsn.tm.kit.edu'
    }
    describe('Test action_parse_member_events_for_room', function () {
      it('Test no user_name collision', async () => {
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
        await expect(action_parse_member({
          state,
          commit: jest.fn(),
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          member_events: member_events,
          permission_event: room_01_permission
        })).resolves.toEqual([room_01_user_info[0], {
          user: {
            user_id: user_2.user_id,
            displayname: ''
          },
          avatar_url: '',
          displayname: '@test-2:dsn.tm.kit.edu',
          is_self: false,
          user_type: 'Member'
        }])
      })
      it('Test two users with the same displayname', async () => {
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
            displayname: 'DSN Test Account No 1',
            membership: 'join'
          },
          state_key: '@test-2:dsn.tm.kit.edu',
          room_id: room_id,
          sender: user_2.user_id,
          origin_server_ts: 0,
          event_id: ''
        }]
        await expect(action_parse_member({
          state,
          commit: jest.fn(),
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          member_events: member_events,
          permission_event: room_01_permission
        })).resolves.toEqual([{
          avatar_url: '',
          user: {
            user_id: '@test-1:dsn.tm.kit.edu',
            displayname: 'DSN Test Account No 1'
          },
          displayname: 'DSN Test Account No 1 (@test-1:dsn.tm.kit.edu)',
          is_self: true,
          user_type: 'Member'
        },
        {
          avatar_url: '',
          user: {
            user_id: '@test-2:dsn.tm.kit.edu',
            displayname: 'DSN Test Account No 1'
          },
          displayname: 'DSN Test Account No 1 (@test-2:dsn.tm.kit.edu)',
          is_self: false,
          user_type: 'Member'
        }])
      })
      it('Test no member events', async () => {
        await expect(action_parse_member({
          state,
          commit: jest.fn(),
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          member_events: [],
          permission_event: room_01_permission
        })).resolves.toEqual([])
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
      it('Test 200 response', async () => {
        const response = {
          status: 200,
          data: ''
        }
        let dispatch_called = false
        const dispatch = () => {
          dispatch_called = true
        }
        mockedAxios.post.mockResolvedValue(response)
        await action_change_memb({
          dispatch,
          rootGetters: jest.fn()
        }, {
          room_id: room_01_room_id,
          user_id: user_1.user_id,
          action: 'invite'
        })
        expect(dispatch_called).toEqual(true)
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
  })
})
