import store from '@/store/sync'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { MatrixRoomEvent, MatrixRoomMemberStateEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { TxCreateEvent, TxEvent } from '@/interface/tx_event.interface'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { uuidgen } from '@/utils/utils'
import { random } from 'lodash'
import axios, { AxiosResponse } from 'axios'
import { POSTFilterCreateResponse } from '@/interface/api.interface'
import {
  initial_sync_response,
  initial_sync_response_no_joined_rooms,
  initial_sync_response_no_rooms,
  luka_room_states,
  sqtv_room_states,
  vrvx_room_states
} from '../mocks/mocked_sync_data'
import { full_tx_data_batch } from '../mocks/mocked_full_tx_data'
import { full_message_data_batch } from '../mocks/mocked_batch_message_data'
import { long_poll_data } from '../mocks/mocked_long_poll_data'
import { resync_data } from '../mocks/mocked_resync_data'

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
      it('Test initial sync no rooms', async function () {
        mockedAxios.get.mockImplementation(async (url: string, data: unknown, config?: unknown): Promise<AxiosResponse<any>> => {
          if (url.includes('sync')) {
            return {
              status: 200,
              data: initial_sync_response_no_rooms,
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else {
            throw new Error('This should not be called!')
          }
        })
        const dispatch = jest.fn()
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, null)
        expect(state.init_state_complete).toEqual(true)
        expect(state.room_events).toEqual({})
      })
      it('Test initial sync no joined rooms', async function () {
        mockedAxios.get.mockImplementation(async (url: string, data: unknown, config?: unknown): Promise<AxiosResponse<any>> => {
          if (url.includes('sync')) {
            return {
              status: 200,
              data: initial_sync_response_no_joined_rooms,
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else {
            throw new Error('This should not be called!')
          }
        })
        const dispatch = jest.fn()
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, null)
        expect(state.init_state_complete).toEqual(true)
        expect(state.room_events).toEqual({})
      })
      it('Test sync with data', async function () {
        const dispatch_table : Record<string, boolean> = {
          'rooms/action_parse_state_events_for_all_rooms': false,
          action_update_state: false
        }
        const dispatch = (dispatch_string: string) => {
          dispatch_table[dispatch_string] = true
        }
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, null)
        expect(state.init_state_complete).toEqual(true)
        expect(Object.values(dispatch_table)).toSatisfyAll(i => i)
        // check next batch
        expect(state.next_batch).toEqual('s2226533_65457631_87720_1938204_312400_253_111327_2735296_33')
        expect(Object.keys(state.room_events)).toContain('!SqtvWlRFkJPEsbntuD:dsn.tm.kit.edu')
        expect(Object.keys(state.room_events)).toContain('!VrVxkmqIUvHOdhwHir:dsn.tm.kit.edu')
        expect(Object.keys(state.room_events)).toContain('!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu')
        expect(Object.keys(state.room_events)).not.toContain('!ElXKiDHBrqPJAcPXFS:dsn.tm.kit.edu')
        expect(state.ignored_rooms.has('!ElXKiDHBrqPJAcPXFS:dsn.tm.kit.edu')).toEqual(true)
        expect(state.room_state_events['!SqtvWlRFkJPEsbntuD:dsn.tm.kit.edu']).toBeArrayOfSize(11) // 2 old states contained
      })
    })
    describe('Test action action_sync_full_tx_events_for_room', function () {
      const action = store.actions.action_sync_full_tx_events_for_room as (context: any, payload: any) => Promise<any>
      // mock rootGetters
      const rootGetters = {
        'auth/homeserver': '',
        'auth/user_id': user_3.user_id
      }
      const room_id = '!jsadEoEqbILtDBnFqN:dsn.tm.kit.edu'
      beforeEach(function () {
        state = store.state()
        state.init_state_complete = true
        mockedAxios.get.mockImplementation(async (url: string, config?: unknown): Promise<AxiosResponse<any>> => {
          const get_config = config as {
            params: {
              from: string
            }
          }
          if (url.includes('messages')) {
            return {
              status: 200,
              data: full_tx_data_batch[Number(get_config.params.from) - 1],
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else {
            return Promise.reject(new Error())
          }
        })
      })
      it('Test loading tx events', async function () {
        state.room_tx_prev_batch_id[room_id] = '2'
        state.room_tx_sync_complete[room_id] = false
        state.room_events[room_id] = []
        state.room_state_events[room_id] = []
        state.cached_tx_events[room_id] = full_tx_data_batch[0].chunk as Array<TxEvent>
        const dispatch = jest.fn()
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          room_id: room_id
        })
        expect(state.room_tx_sync_complete[room_id]).toEqual(true)
        expect(state.processed_events_id.has('$ZA9ovJ8IjCVRY-EMsQjQ34Hw_7Ohyx_BXgYKtd75TMQ')).toEqual(true) // batch 1 processed
        expect(state.processed_events_id.has('$6JFx_-yT3t9eyaFfzlo7jnsR9eszEshYh_c8CHHAfvc')).toEqual(true) // batch 2 processed
        expect(state.processed_events_id.has('$-nvycSKjHFzs3fNjxmKxSHoGkO9UOlQyC6YnqjTjpl4')).toEqual(true) // batch 3 processed
      })
    })
    describe('Test action action_sync_batch_message_events_for_room', function () {
      const action = store.actions.action_sync_batch_message_events_for_room as (context: any, payload: any) => Promise<any>
      // mock rootGetters
      const rootGetters = {
        'auth/homeserver': '',
        'auth/user_id': user_3.user_id
      }
      const room_id = '!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu'
      beforeEach(function () {
        state = store.state()
        state.init_state_complete = true
        mockedAxios.get.mockImplementation(async (url: string, config?: unknown): Promise<AxiosResponse<any>> => {
          const get_config = config as {
            params: {
              from: string
            }
          }
          if (url.includes('messages')) {
            return {
              status: 200,
              data: full_message_data_batch[Number(get_config.params.from) - 1],
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else {
            return Promise.reject(new Error())
          }
        })
      })
      it('Test message batch loading', async function () {
        state.room_message_prev_batch_id[room_id] = '1'
        state.room_events[room_id] = []
        state.room_state_events[room_id] = []
        const dispatch = jest.fn()
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          room_id: room_id
        })
        expect(state.room_events[room_id]).toBeArrayOfSize(30)
        expect(state.processed_events_id.has('$hMVlQ5WwQQNiKZIdiG0fVt8b2qHqYieL57tgaXgqCv8')).toEqual(true)
        expect(state.processed_events_id.has('$eGkGsWiHOBq6mdW8VV8v7Szl6c-Ec2DT09_9SVbKR7g')).toEqual(false)
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          room_id: room_id
        })
        expect(state.room_events[room_id]).toBeArrayOfSize(60)
        expect(state.processed_events_id.has('$eGkGsWiHOBq6mdW8VV8v7Szl6c-Ec2DT09_9SVbKR7g')).toEqual(true)
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          room_id: room_id
        })
        expect(state.room_events[room_id]).toBeArrayOfSize(60)
        expect(state.room_message_prev_batch_id[room_id]).toBeNull()
      })
    })
    describe('Test action action_update_state', function () {
      const action = store.actions.action_update_state as (context: any, payload: any) => Promise<any>
      // mock rootGetters
      const rootGetters = {
        'auth/homeserver': '',
        'auth/user_id': user_3.user_id
      }
      beforeEach(function () {
        state = store.state()
        state.init_state_complete = true
        mockedAxios.get.mockImplementation(async (url: string, config?: unknown): Promise<AxiosResponse<any>> => {
          if (url.includes('sync')) {
            return {
              status: 200,
              data: long_poll_data,
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else if (url.includes('join_rules')) {
            return {
              status: 200,
              data: {
                join_rule: 'invite'
              },
              statusText: 'OK',
              headers: {},
              config: {}
            }
          } else {
            return Promise.reject(new Error())
          }
        })
      })
      it('Test long poll', async function () {
        const room_id_1 = '!SqtvWlRFkJPEsbntuD:dsn.tm.kit.edu'
        const cached_event : TxCreateEvent = {
          content: {
            description: 'aaaa',
            from: user_1.user_id,
            group_id: uuidgen(),
            txs: [
              {
                amount: 125,
                to: user_2.user_id,
                tx_id: uuidgen()
              }
            ]
          },
          event_id: 'cache01',
          origin_server_ts: 500000,
          room_id: room_id_1,
          sender: user_1.user_id,
          type: 'com.matpay.create'
        }
        state.room_events[room_id_1] = []
        state.room_state_events[room_id_1] = []
        state.room_tx_sync_complete[room_id_1] = true
        state.cached_tx_events[room_id_1] = [cached_event]
        const room_id_2 = '!ElXKiDHBrqPJAcPXFS:dsn.tm.kit.edu'
        state.room_events[room_id_2] = []
        state.room_state_events[room_id_2] = []
        state.cached_tx_events[room_id_2] = []
        const dispatched = {
          '!VrVxkmqIUvHOdhwHir:dsn.tm.kit.edu': false,
          '!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu': false,
          '!ElXKiDHBrqPJAcPXFS:dsn.tm.kit.edu': false
        }
        const dispatch = (dispatch_string: string, payload: {room_id: string}) => {
          if (dispatch_string === 'action_resync_initial_state_for_room' &&
            payload.room_id === '!VrVxkmqIUvHOdhwHir:dsn.tm.kit.edu') {
            dispatched[payload.room_id] = true
            state.cached_tx_events[payload.room_id] = []
            state.room_events[payload.room_id] = []
            state.room_state_events[payload.room_id] = []
          }
          if (dispatch_string === 'rooms/action_parse_invited_rooms' &&
            Object.keys(payload).includes('!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu')) {
            dispatched['!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu'] = true
          }
          if (dispatch_string === 'rooms/action_i_am_kicked_from_room' &&
            payload.room_id === '!ElXKiDHBrqPJAcPXFS:dsn.tm.kit.edu') {
            dispatched[payload.room_id] = true
          }
        }
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          timeout: 10
        })
        expect(Object.values(dispatched)).toSatisfyAll(i => i)
        expect(state.processed_events_id.has('$vtEISdkvDDMus03ggfWHtHuiul9H7XLR-2M05ZlgJYM')).toEqual(true)
        expect(state.processed_events_id.has('cache01')).toEqual(true)
        expect(state.cached_tx_events['!VrVxkmqIUvHOdhwHir:dsn.tm.kit.edu']).toSatisfyAny(i => i.event_id === '$dHHsmRzoBIUwmw0w_FpfVfi5YJO-hhfwYuoAxzx6WtY')
      })
    })
    describe('Test action action_resync_initial_state_for_room', function () {
      const action = store.actions.action_resync_initial_state_for_room as (context: any, payload: any) => Promise<any>
      // mock rootGetters
      const rootGetters = {
        'auth/homeserver': '',
        'auth/user_id': user_3.user_id
      }
      beforeEach(function () {
        state = store.state()
        // Mock sync, state, join API
        mockedAxios.get.mockImplementation(async (url: string, data: unknown, config?: unknown): Promise<AxiosResponse<any>> => {
          if (url.includes('sync')) {
            return {
              status: 200,
              data: resync_data,
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
            if (url.includes('luka')) {
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
      it('Test sync one new room', async function () {
        const room_id = '!lukaWOYXtUZYjnCqnz:dsn.tm.kit.edu'
        let dispatched = false
        const dispatch = (dispatch_string: string) => {
          if (dispatch_string === 'rooms/action_parse_state_events_for_all_rooms') {
            dispatched = true
          }
        }
        const commit = (commit_string: string, payload: unknown) => {
          store.mutations[commit_string](state, payload)
        }
        state.init_state_complete = true
        await action({
          state,
          commit: commit,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          room_id: room_id
        })
        expect(state.init_state_complete).toEqual(true)
        expect(Object.keys(state.room_events)).toContain(room_id)
        expect(Object.keys(state.room_state_events)).toContain(room_id)
        expect(Object.keys(state.cached_tx_events)).toContain(room_id)
        expect(state.processed_events_id.has('$hqfOK70PxC-DcaY0Ueiw7lmAMQS-gRajsFjP8E1SSwk')).toEqual(true)
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
