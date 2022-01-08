import store from '@/store/rooms'
import { Room } from '@/models/room.model'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { uuidgen } from '@/utils/utils'
import { user_1 } from '../mocks/mocked_user'

interface State {
  joined_rooms: Room[],
  invited_rooms: Room[]
}

describe('Test rooms store', function () {
  describe('Test store mutation', function () {
    let state: State = {
      joined_rooms: [],
      invited_rooms: []
    }
    beforeEach(function () {
      state = {
        joined_rooms: [],
        invited_rooms: []
      }
    })
    it('Test mutation mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      mutation(state, 'ABC')
      expect(state.joined_rooms[0].room_id).toEqual('ABC')
    })
    it('Test mutation mutation_add_invited_room', function () {
      const mutation = store.mutations.mutation_add_invited_room
      mutation(state, {
        room_id: 'ABC',
        name: 'testName'
      })
      expect(state.invited_rooms[0].room_id).toEqual('ABC')
      expect(state.invited_rooms[0].name).toEqual('testName')
    })
    it('Test mutation mutation_set_name_for_joined_room', function () {
      const mutation = store.mutations.mutation_set_name_for_joined_room
      state.joined_rooms.push({
        room_id: 'ABC',
        name: '',
        state_events: [{
          room_id: 'ABC',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: uuidgen(),
          content: {},
          type: '',
          state_key: ''
        }]
      })
      mutation(state, {
        room_id: 'ABC',
        name: 'testName'
      })
      const rooms = state.joined_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms[0].name).toEqual('testName')
    })
    it('Test mutation mutation_add_state_event_for_joined_room', function () {
      const mutation = store.mutations.mutation_add_state_event_for_joined_room
      state.joined_rooms.push({
        room_id: 'ABC',
        name: '',
        state_events: [{
          room_id: 'ABC',
          sender: user_1.user_id,
          origin_server_ts: 0,
          event_id: 'test_event',
          content: {},
          type: 'test_type',
          state_key: 'test_key'
        }]
      })
      const rooms_original = state.joined_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms_original[0].state_events.filter(i => i.event_id === 'test_event').length).toEqual(1)
      mutation(state, {
        room_id: 'ABC',
        state_event: {
          room_id: 'ABC',
          sender: user_1.user_id,
          origin_server_ts: 1,
          event_id: 'test_change_event',
          content: {},
          type: 'test_type',
          state_key: 'test_key'
        }
      })
      const rooms = state.joined_rooms.filter(r => r.room_id === 'ABC')
      expect(rooms[0].state_events.filter(i => i.event_id === 'test_event')).toEqual([])
      expect(rooms[0].state_events.filter(i => i.event_id === 'test_change_event').length).toEqual(1)
    })
  })
  describe('Test store getters', function () {
    let state: State = {
      joined_rooms: [],
      invited_rooms: []
    }
    beforeEach(function () {
      state = {
        joined_rooms: [],
        invited_rooms: []
      }
    })
    it('Test getter get_room_name', function () {
      const getter = store.getters.get_room_name(state, null, null, null)
      state.joined_rooms.push({
        room_id: 'abc',
        name: 'ABCD',
        state_events: []
      })
      expect(getter('abc')).toEqual('ABCD')
    })
  })
})
