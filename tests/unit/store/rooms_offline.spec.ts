import { MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import store from '@/store/rooms'
import axios from 'axios'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

interface State {
  room_state_events: Record<string, MatrixRoomStateEvent[]>,
}

const matrix_example_data = [
  {
    content: {
      join_rule: 'public'
    },
    type: 'm.room.join_rules',
    event_id: '$143273582443PhrSn:example.org',
    room_id: '!636q39766251:example.com',
    sender: '@example:example.org',
    origin_server_ts: 1432735824653,
    unsigned: {
      age: 1234
    },
    state_key: ''
  },
  {
    content: {
      membership: 'join',
      avatar_url: 'mxc://example.org/SEsfnsuifSDFSSEF',
      displayname: 'Alice Margatroid'
    },
    type: 'm.room.member',
    event_id: '$143273582443PhrSn:example.org',
    room_id: '!636q39766251:example.com',
    sender: '@example:example.org',
    origin_server_ts: 1432735824653,
    unsigned: {
      age: 1234
    },
    state_key: '@alice:example.org'
  },
  {
    content: {
      creator: '@example:example.org',
      room_version: '1',
      'm.federate': true,
      predecessor: {
        event_id: '$something:example.org',
        room_id: '!oldroom:example.org'
      }
    },
    type: 'm.room.create',
    event_id: '$143273582443PhrSn:example.org',
    room_id: '!636q39766251:example.com',
    sender: '@example:example.org',
    origin_server_ts: 1432735824653,
    unsigned: {
      age: 1234
    },
    state_key: ''
  },
  {
    content: {
      ban: 50,
      events: {
        'm.room.name': 100,
        'm.room.power_levels': 100
      },
      events_default: 0,
      invite: 50,
      kick: 50,
      redact: 50,
      state_default: 50,
      users: {
        '@example:localhost': 100
      },
      users_default: 0,
      notifications: {
        room: 20
      }
    },
    type: 'm.room.power_levels',
    event_id: '$143273582443PhrSn:example.org',
    room_id: '!636q39766251:example.com',
    sender: '@example:example.org',
    origin_server_ts: 1432735824653,
    unsigned: {
      age: 1234
    },
    state_key: ''
  }
]
describe('Test rooms Vuex store', () => {
  describe('Test mutations', () => {
    it('Test mutation mutation_set_joined_rooms', () => {
      const rooms_1 = ['aaa', 'bbb']
      const state: State = {
        room_state_events: {}
      }
      store.mutations.mutation_set_joined_rooms(state, { joined_rooms: rooms_1 })
      expect(state.room_state_events).toEqual({
        aaa: [],
        bbb: []
      })
      const rooms_2 = ['ccc', 'ddd']
      store.mutations.mutation_set_joined_rooms(state, { joined_rooms: rooms_2 })
      expect(state.room_state_events).toEqual({ // test overwrite
        ccc: [],
        ddd: []
      })
    })
    it('Test mutation mutation_set_state_event_for_joined_room', () => {
      const state: State = {
        room_state_events: {}
      }
      store.mutations.mutation_set_state_event_for_joined_room(state, {
        room_id: 'aaa',
        state_event: [{
          type: 'm.room.name',
          state_key: '',
          content: {
            name: 'test'
          }
        }]
      })
      expect(state.room_state_events).toEqual({
        aaa: [{
          type: 'm.room.name',
          state_key: '',
          content: {
            name: 'test'
          }
        }]
      })
      store.mutations.mutation_set_state_event_for_joined_room(state, {
        room_id: 'bbb',
        state_event: [{
          type: 'm.room.name',
          state_key: '',
          content: {
            name: 'test2'
          }
        }]
      })
      expect(state.room_state_events).toEqual({ // test independence
        aaa: [{
          type: 'm.room.name',
          state_key: '',
          content: {
            name: 'test'
          }
        }],
        bbb: [{
          type: 'm.room.name',
          state_key: '',
          content: {
            name: 'test2'
          }
        }]
      })
    })
  })
  describe('Test actions offline', () => {
    it('Test action action_get_joined_rooms', async () => {
      const action = store.actions.action_get_joined_rooms as (context: any, payload: any) => Promise<any>
      mockedAxios.get.mockImplementation(() => Promise.resolve({
        data: {
          joined_rooms: ['aaa', 'bbb']
        }
      }))
      const result = await action({
        commit: jest.fn(),
        rootGetters: { 'auth/homeserver': '' }
      }, {})
      expect(result).toEqual({
        joined_rooms: ['aaa', 'bbb']
      })
    })
    it('Test action action_get_all_joined_room_state_events', async () => {
      let committed = false
      const action = store.actions.action_get_all_joined_room_state_events as (context: any, payload: any) => Promise<any>
      const state: State = {
        room_state_events: {
          '!636q39766251:example.com': []
        }
      }
      const commit = (mutation: string, payload: any) => {
        switch (mutation) {
          case 'mutation_set_state_event_for_joined_room':
            committed = true
        }
      }
      mockedAxios.get.mockImplementation(() => Promise.resolve({
        data: matrix_example_data
      }))
      await expect(
        action({
          commit,
          rootGetters: { 'auth/homeserver': '' },
          state
        }, {})
      ).resolves.toEqual([
        {
          room_id: '!636q39766251:example.com',
          state_event: matrix_example_data
        }
      ])
      expect(committed).toBeTruthy()
    })
    it('Test action action_get_room_state_events', async () => {
      let committed = false
      const action = store.actions.action_get_room_state_events as (context: any, payload: any) => Promise<any>
      const state: State = {
        room_state_events: {
          '!636q39766251:example.com': []
        }
      }
      const commit = (mutation: string, payload: any) => {
        switch (mutation) {
          case 'mutation_set_state_event_for_joined_room':
            committed = true
        }
      }
      mockedAxios.get.mockImplementation(() => Promise.resolve({
        data: matrix_example_data
      }))
      await expect(
        action({
          commit,
          rootGetters: { 'auth/homeserver': '' },
          state
        }, { room_id: '!636q39766251:example.com' })
      ).resolves.toEqual({
        room_id: '!636q39766251:example.com',
        state_event: matrix_example_data
      })
      expect(committed).toBeTruthy()
    })
    it('Test action action_change_user_membership_on_room success', async () => {
      let dispatched = false
      const action = store.actions.action_change_user_membership_on_room as (context: any, payload: any) => Promise<any>
      const dispatch = (action: string, payload: any) => {
        switch (action) {
          case 'action_get_room_state_events':
            dispatched = true
        }
      }
      mockedAxios.post.mockImplementation(() => Promise.resolve({ status: 200 }))
      await expect(
        action({
          dispatch,
          rootGetters: { 'auth/homeserver': '' }
        }, {
          room_id: '!636q39766251:example.com',
          user_id: '@example:example.com',
          membership: 'join'
        })
      ).resolves.toBeUndefined()
      expect(dispatched).toBeTruthy()
    })
    it('Test action action_change_user_membership_on_room failure', async () => {
      let dispatched = false
      const action = store.actions.action_change_user_membership_on_room as (context: any, payload: any) => Promise<any>
      const dispatch = (action: string, payload: any) => {
        switch (action) {
          case 'action_get_room_state_events':
            dispatched = true
        }
      }
      mockedAxios.post.mockImplementation(() => Promise.resolve({ status: 400 }))
      await expect(
        action({
          dispatch,
          rootGetters: { 'auth/homeserver': '' }
        }, {
          room_id: '!636q39766251:example.com',
          user_id: '@example:example.com',
          membership: 'join'
        })
      ).rejects.toThrowError()
      expect(dispatched).toBeFalsy()
    })
  })
  describe('Test getters', () => {
    it('Test getter get_member_state_events_for_room', () => {
      const getter = store.getters.get_member_state_events_for_room
      const state = {
        room_state_events: {
          '!636q39766251:example.com': matrix_example_data
        }
      }
      expect(getter(state, null, null, null)('!636q39766251:example.com')).toEqual([
        matrix_example_data[1]
      ])
    })
    it('Test getter get_room_name', () => {
      const getter = store.getters.get_room_name
      const state = {
        room_state_events: {
          '!636q39766251:example.com': matrix_example_data
        }
      }
      expect(getter(state, null, null, null)('!636q39766251:example.com')).toBeNull()
    })
    it('Test getter get_room_permissions', () => {
      const getter = store.getters.get_room_permissions
      const state = {
        room_state_events: {
          '!636q39766251:example.com': matrix_example_data
        }
      }
      expect(getter(state, null, null, null)('!636q39766251:example.com')).toEqual(
        matrix_example_data[3].content
      )
    })
  })
})
