import store from '@/store/sync'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { TxCreateEvent, TxEvent } from '@/interface/tx_event.interface'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { uuidgen } from '@/utils/utils'
import { random } from 'lodash'
import axios, { AxiosResponse } from 'axios'
import { POSTFilterCreateResponse } from '@/interface/api.interface'
import { initial_sync_response, luka_room_states, sqtv_room_states, vrvx_room_states } from '../mocks/mocked_sync_data'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

interface State {
  next_batch: string,
  processed_events_id: Set<MatrixEventID>,
  room_events: Record<MatrixRoomID, Array<MatrixRoomEvent>>,
  room_state_events: Record<MatrixRoomID, Array<MatrixRoomStateEvent>>,
  init_state_complete: boolean,
  room_tx_prev_batch_id: Record<MatrixRoomID, string>,
  room_message_prev_batch_id: Record<MatrixRoomID, string | null>
  room_tx_sync_complete: Record<MatrixRoomID, boolean>,
  cached_tx_events: Record<MatrixRoomID, Array<TxEvent>>,
  sync_filter: string,
  long_poll_controller: AbortController,
  ignored_rooms: Set<MatrixRoomID>
}

describe('Test sync store', function () {
  let state = store.state()
  describe('Test store mutations', function () {
    beforeEach(function () {
      state = store.state()
    })
    it('Test mutation mutation_set_next_batch', function () {
      const mutation = store.mutations.mutation_set_next_batch
      const batch_id = 'abcd'
      mutation(state, {
        next_batch: batch_id
      })
      expect(state.next_batch).toEqual(batch_id)
    })
    it('Test mutation mutation_create_new_room', function () {
      const mutation = store.mutations.mutation_create_new_room
      const room_id = 'aaa'
      mutation(state, room_id)
      expect(state.room_events[room_id]).toEqual([])
      expect(state.room_state_events[room_id]).toEqual([])
      expect(state.room_tx_prev_batch_id[room_id]).toEqual('')
      expect(state.room_message_prev_batch_id[room_id]).toBeFalsy()
      expect(state.room_tx_sync_complete[room_id]).toBe(false)
      expect(state.cached_tx_events[room_id]).toEqual([])
    })
    it('Test mutation mutation_remove_room', function () {
      const mutation = store.mutations.mutation_remove_room
      const room_id = 'aaa'
      state.room_events[room_id] = []
      state.room_state_events[room_id] = []
      state.room_tx_prev_batch_id[room_id] = 'abc'
      state.room_message_prev_batch_id[room_id] = 'cde'
      state.room_tx_sync_complete[room_id] = true
      state.cached_tx_events[room_id] = []
      mutation(state, room_id)
      expect(state.room_events[room_id]).toBeUndefined()
      expect(state.room_state_events[room_id]).toBeUndefined()
      expect(state.room_tx_prev_batch_id[room_id]).toBeUndefined()
      expect(state.room_message_prev_batch_id[room_id]).toBeUndefined()
      expect(state.room_tx_sync_complete[room_id]).toBeUndefined()
      expect(state.cached_tx_events[room_id]).toBeUndefined()
    })
    it('Test mutation mutation_add_cached_tx_event', function () {
      const mutation = store.mutations.mutation_add_cached_tx_event
      const room_id = 'aaa'
      const group_id = uuidgen()
      const tx_id = uuidgen()
      const event_1: TxCreateEvent = {
        content: {
          description: 'tx1',
          from: user_1.user_id,
          group_id: group_id,
          txs: [{
            amount: 50,
            to: user_2.user_id,
            tx_id: tx_id
          }]
        },
        event_id: 'abc',
        origin_server_ts: 0,
        room_id: room_id,
        sender: user_1.user_id,
        type: 'com.matpay.create'
      }
      state.cached_tx_events[room_id] = []
      mutation(state, {
        room_id: room_id,
        event: event_1
      })
      expect(state.cached_tx_events[room_id]).toEqual([event_1])
    })
    it('Test mutation mutation_process_event - message event', function () {
      const mutation = store.mutations.mutation_process_event
      const room_id = 'aaa'
      const group_id = uuidgen()
      const tx_id = uuidgen()
      const event_1: TxCreateEvent = {
        content: {
          description: 'tx1',
          from: user_1.user_id,
          group_id: group_id,
          txs: [{
            amount: 50,
            to: user_2.user_id,
            tx_id: tx_id
          }]
        },
        event_id: 'e01',
        origin_server_ts: 0,
        room_id: room_id,
        sender: user_1.user_id,
        type: 'com.matpay.create'
      }
      state.room_events[room_id] = []
      mutation(state, {
        room_id: room_id,
        event: event_1
      })
      expect(state.room_events[room_id]).toEqual([event_1])
      expect(state.processed_events_id.has('e01')).toEqual(true)
    })
    it('Test mutation mutation_process_event - state event', function () {
      const mutation = store.mutations.mutation_process_event
      const room_id = 'aaa'
      const event_1: MatrixRoomMemberStateEvent = {
        content: {
          avatar_url: '',
          displayname: user_1.displayname,
          membership: 'join'
        },
        event_id: 'e02',
        origin_server_ts: 6000,
        room_id: room_id,
        sender: user_1.user_id,
        state_key: user_1.user_id,
        type: 'm.room.member'
      }
      state.room_state_events[room_id] = []
      mutation(state, {
        room_id: room_id,
        event: event_1
      })
      expect(state.room_state_events[room_id]).toEqual([event_1])
      expect(state.processed_events_id.has('e02')).toEqual(true)
    })
    it('Test mutation mutation_init_state_complete', function () {
      const mutation = store.mutations.mutation_init_state_complete
      const old_controller = state.long_poll_controller
      mutation(state)
      expect(state.init_state_complete).toEqual(true)
      expect(state.long_poll_controller).not.toBe(old_controller)
    })
    it('Test mutation mutation_init_state_incomplete', function () {
      const mutation = store.mutations.mutation_init_state_incomplete
      const old_controller = state.long_poll_controller
      state.init_state_complete = true
      mutation(state)
      expect(state.init_state_complete).toEqual(false)
      expect(state.long_poll_controller).not.toBe(old_controller)
    })
    it('Test mutation mutation_set_room_tx_prev_batch', function () {
      const mutation = store.mutations.mutation_set_room_tx_prev_batch
      const room_id = 'aaa'
      const prev_batch = uuidgen()
      mutation(state, {
        room_id: room_id,
        prev_batch: prev_batch
      })
      expect(state.room_tx_prev_batch_id[room_id]).toEqual(prev_batch)
    })
    it('Test mutation mutation_set_room_msg_prev_batch', function () {
      const mutation = store.mutations.mutation_set_room_msg_prev_batch
      const room_id = 'aaa'
      const prev_batch = uuidgen()
      mutation(state, {
        room_id: room_id,
        prev_batch: prev_batch
      })
      expect(state.room_message_prev_batch_id[room_id]).toEqual(prev_batch)
    })
    it('Test mutation mutation_set_room_msg_prev_batch - null case', function () {
      const mutation = store.mutations.mutation_set_room_msg_prev_batch
      const room_id = 'aaa'
      const prev_batch = null
      mutation(state, {
        room_id: room_id,
        prev_batch: prev_batch
      })
      expect(state.room_message_prev_batch_id[room_id]).toBeNull()
    })
    it('Test mutation mutation_room_tx_sync_state_complete', function () {
      const mutation = store.mutations.mutation_room_tx_sync_state_complete
      const room_id = 'abcd'
      mutation(state, room_id)
      expect(state.room_tx_sync_complete[room_id]).toEqual(true)
    })
    it('Test mutation mutation_set_sync_filter', function () {
      const mutation = store.mutations.mutation_set_sync_filter
      const filter_id = random(100).toString()
      mutation(state, filter_id)
      expect(state.sync_filter).toEqual(filter_id)
    })
    it('Test mutation mutation_add_ignored_room', function () {
      const mutation = store.mutations.mutation_add_ignored_room
      mutation(state, 'abc')
      expect(state.ignored_rooms.has('abc')).toEqual(true)
    })
    it('Test mutation mutation_reset_state', function () {
      const mutation = store.mutations.mutation_reset_state
      const room_id = 'aaa'
      const group_id = uuidgen()
      const tx_id = uuidgen()
      state.sync_filter = 'dfsdgs'
      state.init_state_complete = true
      state.room_events[room_id] = [{
        content: {
          description: 'tx1',
          from: user_1.user_id,
          group_id: group_id,
          txs: [{
            amount: 50,
            to: user_2.user_id,
            tx_id: tx_id
          }]
        },
        event_id: 'e01',
        origin_server_ts: 0,
        room_id: room_id,
        sender: user_1.user_id,
        type: 'com.matpay.create'
      }]
      state.room_tx_sync_complete[room_id] = true
      mutation(state)
      expect(state.init_state_complete).toEqual(false)
      expect(state.room_events).toEqual({})
      expect(state.room_tx_sync_complete).toEqual({})
      expect(state.sync_filter).toEqual('')
      expect(state.room_tx_prev_batch_id).toEqual({})
      expect(state.room_message_prev_batch_id).toEqual({})
    })
  })
  describe('Test store actions', function () {
    describe('Test action action_sync_initial_state', function () {
      const action = store.actions.action_sync_initial_state as (context: any, payload: any) => Promise<any>
      // mock rootGetters
      const rootGetters = {
        'auth/homeserver': '',
        'auth/user_id': user_3.user_id
      }
      beforeEach(function () {
        state = store.state()
        // mock filter response
        mockedAxios.post.mockImplementation(async (url: string, data: unknown, config?: unknown): Promise<AxiosResponse<POSTFilterCreateResponse>> => {
          if (url.includes('filter')) {
            return {
              status: 200,
              data: {
                filter_id: '1'
              },
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else {
            return Promise.reject(new Error())
          }
        })
        // Mock sync, state, join API
        mockedAxios.get.mockImplementation(async (url: string, data: unknown, config?: unknown): Promise<AxiosResponse<any>> => {
          if (url.includes('sync')) {
            return {
              status: 200,
              data: initial_sync_response,
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else if (url.includes('join_rules')) {
            if (url.includes('ElXK')) {
              return {
                status: 200,
                data: {
                  join_rule: 'public'
                },
                statusText: 'OK',
                headers: {},
                config: {}
              }
            } else {
              return {
                status: 200,
                data: {
                  join_rule: 'invite'
                },
                statusText: 'OK',
                headers: {},
                config: {}
              }
            }
          } else if (url.includes('state')) {
            if (url.includes('Sqtv')) {
              return {
                status: 200,
                data: sqtv_room_states,
                statusText: 'OK',
                headers: {},
                config: {}
              }
            } else if (url.includes('VrVx')) {
              return {
                status: 200,
                data: vrvx_room_states,
                statusText: 'OK',
                headers: {},
                config: {}
              }
            } else if (url.includes('luka')) {
              return {
                status: 200,
                data: luka_room_states,
                statusText: 'OK',
                headers: {},
                config: {}
              }
            } else {
              return Promise.reject(new Error('You should not request this room!'))
            }
          } else {
            return Promise.reject(new Error('No matching API!'))
          }
        })
      })
      it('Test already synced', async function () {
        state.init_state_complete = true
        const dispatch = jest.fn()
        const commit = jest.fn()
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, null)
        expect(mockedAxios.get).not.toHaveBeenCalled()
        expect(mockedAxios.post).not.toHaveBeenCalled()
        expect(commit).not.toHaveBeenCalled()
        expect(dispatch).not.toHaveBeenCalled()
      })
      xit('Test sync with data', async function () {
        console.log('Not tested yet')
      })
    })
  })
  describe('Test store getters', function () {
    beforeEach(function () {
      state = {
        next_batch: 'abcd-efgh',
        processed_events_id: new Set(),
        room_events: {},
        room_state_events: {},
        init_state_complete: true,
        room_tx_prev_batch_id: {},
        room_message_prev_batch_id: {
          aaa: 'abcd',
          bbb: null
        },
        room_tx_sync_complete: {
          aaa: true
        },
        cached_tx_events: {},
        sync_filter: '',
        long_poll_controller: new AbortController(),
        ignored_rooms: new Set()
      }
    })
    it('Test getter get_next_batch_id', function () {
      const getter = store.getters.get_next_batch_id
      expect(getter(state, null, null, null)).toEqual('abcd-efgh')
    })
    it('Test getter is_initial_sync_complete', function () {
      const getter = store.getters.is_initial_sync_complete
      expect(getter(state, null, null, null)).toEqual(true)
    })
    it('Test getter is_room_synced', function () {
      const getter = store.getters.is_room_synced(state, null, null, null)
      expect(getter('aaa')).toEqual(true)
    })
    it('Test getter is_chat_sync_complete', function () {
      const getter = store.getters.is_chat_sync_complete(state, null, null, null)
      expect(getter('aaa')).toEqual(false)
      expect(getter('bbb')).toEqual(true)
    })
  })
})
