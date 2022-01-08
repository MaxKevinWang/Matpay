import store from '@/store/user'
import { RoomUserInfo, User } from '@/models/user.model'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { MatrixRoomMemberStateEvent, MatrixRoomPermissionConfiguration } from '@/interface/rooms_event.interface'
import { room_01_permission, room_01_user_info, user_1 } from '../mocks/mocked_user'

interface State {
  users_info: Record<MatrixRoomID, Array<RoomUserInfo>>,
  permissions: Record<MatrixRoomID, MatrixRoomPermissionConfiguration>
}

describe('Test user store', function () {
  describe('Test store mutation', function () {
    const room_id = 'ABC'
    let state : State = {
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
      }
    }
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
  })
  describe('Test store actions', function () {
    const room_id = 'ABC'
    let state : State = {
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
      }
    }
    const rootGetters = {
      'auth/homeserver': '!ghjfghkdk:dsn.scc.kit.edu',
      'auth/user_id': '@test-1:dsn.tm.kit.edu'
    }
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
        }
      }
    })
    it('Test action_parse_member_events_for_room', async () => {
      const action = store.actions.action_parse_member_events_for_room as (context: any, payload: any) => Promise<Array<RoomUserInfo>>
      const member_events : MatrixRoomMemberStateEvent[] = []
      const member_event : MatrixRoomMemberStateEvent = {
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
      member_events.push(member_event)
      await expect(action({
        state,
        commit: jest.fn(),
        rootGetters: rootGetters
      }, {
        room_id: room_id,
        member_events: member_events,
        permission_event: room_01_permission
      })).resolves.toEqual([room_01_user_info[0]])
    })
  })
})
