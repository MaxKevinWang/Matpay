import { newStore } from '@/store'
import { Dispatch, Payload } from 'vuex'
import { TxCreateEvent, TxRejectedEvent } from '@/interface/tx_event.interface'
import { user_1, user_2 } from '../mocks/mocked_user'
import { MatrixRoomChatMessageEvent, MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { uuidgen } from '@/utils/utils'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'

describe('Test plugin: event dispatcher', function () {
  let store = newStore()
  beforeEach(function () {
    store = newStore()
  })
  it('Test mutation auth/mutation_logout', function () {
    store.state.sync.init_state_complete = true
    const mutation_called = {
      sync: false,
      rooms: false,
      user: false,
      chat: false,
      tx: false
    }
    store.subscribe((mutation, state) => {
      const type = mutation.type
      switch (type) {
        case 'rooms/mutation_reset_state':
          mutation_called.rooms = true
          break
        case 'sync/mutation_reset_state':
          mutation_called.sync = true
          break
        case 'user/mutation_reset_state':
          mutation_called.user = true
          break
        case 'chat/mutation_reset_state':
          mutation_called.chat = true
          break
        case 'tx/mutation_reset_state':
          mutation_called.tx = true
          break
      }
    })
    store.commit('auth/mutation_logout')
    expect(store.state.sync.init_state_complete).toEqual(false)
    expect(Object.values(mutation_called)).toSatisfyAll(i => i)
  })
  it('Test mutation sync/mutation_create_new_room', function () {
    const room_id = 'aaa'
    const mutation_called = {
      rooms: false,
      user: false,
      chat: false,
      tx: false
    }
    store.subscribe((mutation, state) => {
      const type = mutation.type
      switch (type) {
        case 'rooms/mutation_init_joined_room':
          mutation_called.rooms = true
          break
        case 'user/mutation_init_joined_room':
          mutation_called.user = true
          break
        case 'chat/mutation_init_joined_room':
          mutation_called.chat = true
          break
        case 'tx/mutation_init_joined_room':
          mutation_called.tx = true
          break
      }
    })
    store.commit('sync/mutation_create_new_room', room_id)
    expect(Object.values(mutation_called)).toSatisfyAll(i => i)
  })
  it('Test mutation sync/mutation_remove_room', function () {
    const room_id = 'aaa'
    const mutation_called = {
      rooms: false,
      user: false,
      chat: false,
      tx: false
    }
    store.subscribe((mutation, state) => {
      const type = mutation.type
      switch (type) {
        case 'rooms/mutation_remove_joined_room':
          mutation_called.rooms = true
          break
        case 'user/mutation_remove_joined_room':
          mutation_called.user = true
          break
        case 'chat/mutation_remove_joined_room':
          mutation_called.chat = true
          break
        case 'tx/mutation_remove_joined_room':
          mutation_called.tx = true
          break
      }
    })
    store.commit('sync/mutation_remove_room', room_id)
    expect(Object.values(mutation_called)).toSatisfyAll(i => i)
  })
  describe('Test mutation sync/mutation_process_event', function () {
    const room_id = 'aaa'
    beforeEach(() => {
      store.commit('sync/mutation_create_new_room', room_id)
    })
    it('Test rejected event (account data)', function () {
      let action_parse_called = false
      const event : TxRejectedEvent = {
        content: { events: [] },
        event_id: 'abc',
        origin_server_ts: 0,
        room_id: room_id,
        sender: user_1.user_id,
        state_key: '',
        type: 'com.matpay.rejected'
      }
      store.dispatch = jest.fn((type: string, payload: unknown, options: unknown) : Promise<any> => {
        if (type === 'chat/action_parse_rejected_event_for_room') {
          action_parse_called = true
        }
        return Promise.resolve()
      }) as unknown as Dispatch
      store.commit('sync/mutation_process_event', {
        room_id: room_id,
        event: event
      })
      expect(action_parse_called).toEqual(true)
    })
    it('Test m.room.name event, sync incomplete', function () {
      let called = false
      store.subscribe((mutation, state) => {
        const type = mutation.type
        if (type === 'rooms/mutation_add_state_event_for_joined_room') {
          called = true
        }
      })
      const event : MatrixRoomStateEvent = {
        content: { name: 'name' },
        event_id: 'abc',
        origin_server_ts: 0,
        room_id: room_id,
        sender: user_1.user_id,
        state_key: '',
        type: 'm.room.name'
      }
      store.commit('sync/mutation_process_event', {
        room_id: room_id,
        event: event
      })
      expect(called).toEqual(true)
    })
    it('Test m.room.name event, sync complete', function () {
      let called = false
      store.state.sync.init_state_complete = true
      store.dispatch = jest.fn((type: string, payload: unknown, options: unknown) : Promise<any> => {
        if (type === 'rooms/action_parse_single_state_event_for_room') {
          called = true
        }
        return Promise.resolve()
      }) as unknown as Dispatch
      const event : MatrixRoomStateEvent = {
        content: { name: 'name' },
        event_id: 'abc',
        origin_server_ts: 0,
        room_id: room_id,
        sender: user_1.user_id,
        state_key: '',
        type: 'm.room.name'
      }
      store.commit('sync/mutation_process_event', {
        room_id: room_id,
        event: event
      })
      expect(called).toEqual(true)
    })
    it('Test message event', function () {
      let called = false
      store.state.sync.init_state_complete = true
      store.dispatch = jest.fn((type: string, payload: unknown, options: unknown) : Promise<any> => {
        if (type === 'chat/action_parse_single_chat_message_event_for_room') {
          called = true
        }
        return Promise.resolve()
      }) as unknown as Dispatch
      const event : MatrixRoomChatMessageEvent = {
        content: {
          msgtype: 'm.text',
          body: 'hello!'
        },
        event_id: 'abc',
        origin_server_ts: 1000,
        room_id: room_id,
        sender: user_1.user_id,
        type: 'm.room.message'
      }
      store.commit('sync/mutation_process_event', {
        room_id: room_id,
        event: event
      })
      expect(called).toEqual(true)
    })
    it('Test tx event (create)', function () {
      let called = false
      store.state.sync.init_state_complete = true
      store.state.sync.room_tx_sync_complete[room_id] = true
      store.dispatch = jest.fn((type: string, payload: unknown, options: unknown) : Promise<any> => {
        if (type === 'tx/action_parse_single_tx_event_for_room') {
          called = true
        }
        return Promise.resolve()
      }) as unknown as Dispatch
      const event : TxCreateEvent = {
        content: {
          description: 'abc',
          from: user_1.user_id,
          group_id: uuidgen(),
          txs: [
            {
              amount: 1000,
              to: user_2.user_id,
              tx_id: uuidgen()
            }
          ]
        },
        event_id: '',
        origin_server_ts: 1000,
        room_id: room_id,
        sender: user_1.user_id,
        type: 'com.matpay.create'
      }
      store.commit('sync/mutation_process_event', {
        room_id: room_id,
        event: event
      })
      expect(called).toEqual(true)
    })
  })
  it('Test mutation sync/mutation_room_tx_sync_state_complete', function () {
    const room_id = 'abc'
    const action_called : Record<MatrixEventID, boolean> = {
      e01: false,
      e02: false
    }
    store.state.sync.room_events[room_id] = [
      {
        type: 'com.matpay.create',
        event_id: 'e01'
      },
      {
        type: 'com.matpay.approve',
        event_id: 'e02'
      }
    ]
    store.dispatch = jest.fn((type: string, payload: {
      room_id: MatrixRoomID,
      tx_events: Array<MatrixRoomEvent>
    }, options: unknown) : Promise<any> => {
      if (type === 'tx/action_parse_all_tx_events_for_room') {
        for (const e of payload.tx_events) {
          action_called[e.event_id] = true
        }
      }
      return Promise.resolve()
    }) as unknown as Dispatch
    store.commit('sync/mutation_room_tx_sync_state_complete', room_id)
    expect(Object.values(action_called)).toSatisfyAll(i => i)
  })
})
