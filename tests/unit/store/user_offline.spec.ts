import store from '@/store/user'
import { RoomUserInfo, User } from '@/models/user.model'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { MatrixRoomPermissionConfiguration } from '@/interface/rooms_event.interface'
import { room_01_user_info } from '../mocks/mocked_user'

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
    // state.users_info = { ABC: room_01_user_info }
    it('Test mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      state.users_info = {}
      mutation(state, 'ABC')
      expect(state.users_info).toEqual({ ABC: [] })
    })
  })
})
