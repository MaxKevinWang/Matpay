import store from '@/store/tx'
import { MatrixRoomID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { room_01_user_info, user_1, user_2, user_a, user_3 } from '../mocks/mocked_user'
import { uuidgen } from '@/utils/utils'
import axios from 'axios'

let url = ''
let body = {}

jest.mock('axios')

const mockedAxios = axios as jest.Mocked<typeof axios>

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    optimized_graph: TxGraph
  }>
}

describe('Test action_create_tx_for_room', () => {
  const action = store.actions.action_create_tx_for_room as (context: any, payload: any) => Promise<boolean>
  const room_id = 'aaa'
  let state: State = {
    transactions: {
      aaa: {
        basic: [],
        pending_approvals: [],
        graph: {
          graph: {}
        },
        optimized_graph: {
          graph: {}
        }
      }
    }
  }
  const rootGetters = {
    'user/get_users_info_for_room': (r: MatrixRoomID) => {
      if (r === room_id) {
        return room_01_user_info
      }
    },
    'auth/user_id': user_2.user_id,
    'auth/homeserver': 'https://tchncs.de'
  }
  const getters = {
    get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
    get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
    get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
    get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
  }
  beforeEach(() => {
    state = { // clear mocks
      transactions: {
        aaa: {
          basic: [],
          pending_approvals: [],
          graph: {
            graph: {}
          },
          optimized_graph: {
            graph: {}
          }
        }
      }
    }
    url = ''
    body = {}
  })
  describe('Test against implementation errors', () => {
    it('Test UUID´s are filled', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: uuidgen(),
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Implementation Error: do not fill the UUIDs!'))
    })
    it('Test state is not set to defined', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Implementation Error: set state to defined!'))
    })
    it('Test there are no pending approvals', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: [{
          event_id: '',
          type: 'create',
          group_id: '',
          approvals: {},
          from: user_1,
          description: '',
          timestamp: new Date(),
          txs: []
        }]
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Implementation Error: no pending approvals, especially not itself!'))
    })
    it('Test user in tx is not in the room', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_a,
          tx_id: '',
          amount: 5
        }],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Implementation Error: user not in room!'))
    })
  })
  describe('Test other errors', () => {
    it('Test current user not part of the transaction', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_3,
          tx_id: '',
          amount: 5
        }],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Error: current user not part of the transaction!'))
    })
    it('Test duplicate to site', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_2,
          tx_id: '',
          amount: 5
        }, {
          to: user_2,
          tx_id: '',
          amount: 5
        }],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Error: duplicate transaction target detected!'))
    })
    it('Test amount must be positive after splitting', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_3,
          tx_id: '',
          amount: 5
        }, {
          to: user_2,
          tx_id: '',
          amount: -5
        }],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Error: all amounts after splitting must be positive!'))
    })
    it('Test description must be non-empty', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_3,
          tx_id: '',
          amount: 5
        }, {
          to: user_2,
          tx_id: '',
          amount: 5
        }],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Error: description must be non-empty!'))
    })
  })
  describe('Test creating event and sending to Matrix', () => {
    it('Test first axios.put fails with a 400 error', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_3,
          tx_id: '',
          amount: 5
        }, {
          to: user_2,
          tx_id: '',
          amount: 5
        }],
        description: 'Meal',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const response = {
        status: 400,
        data: {
          errcode: 'M_UNKNOWN',
          error: 'An unknown error occurred'
        }
      }
      mockedAxios.put.mockImplementation(async (url: string) => {
        if (url.split('/').filter(i => i === 'com.matpay.create').length > 0) {
          return Promise.resolve(response)
        }
      })
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('An unknown error occurred'))
    })
    it('Test second axios.put fails with a 400 error', async () => {
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_1,
        group_id: '',
        state: 'defined',
        txs: [{
          to: user_3,
          tx_id: '',
          amount: 5
        }, {
          to: user_2,
          tx_id: '',
          amount: 5
        }],
        description: 'Meal',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const create_event_response = {
        status: 200,
        data: {
          event_id: 'ID'
        }
      }
      const approve_event_response = {
        status: 400,
        data: {
          errcode: 'M_UNKNOWN',
          error: 'Approve event failed!'
        }
      }
      mockedAxios.put.mockImplementation(async (url: string) => {
        if (url.split('/').filter(i => i === 'com.matpay.create').length > 0) {
          return Promise.resolve(create_event_response)
        } else if (url.split('/').filter(i => i === 'com.matpay.approve').length > 0) {
          return Promise.resolve(approve_event_response)
        }
      })
      await expect(action({
        state,
        commit: jest.fn(),
        dispatch: jest.fn(),
        getters: getters,
        rootGetters: rootGetters
      }, {
        room_id: 'aaa',
        tx: fake_grouped_tx1
      })).rejects.toThrow(new Error('Approve event failed!'))
      expect(create_event_response.data.event_id).toEqual('ID')
    })
  })
})
