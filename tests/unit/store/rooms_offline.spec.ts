import store from '@/store/rooms'
import { Room } from '@/models/room.model'
interface State {
  joined_rooms: Room[],
  invited_rooms: Room[]
}

describe('Test rooms store', function () {
  describe('Test store mutation', function () {
    let state : State = {
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
  })
  describe('Test store getters', function () {
    let state : State = {
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
