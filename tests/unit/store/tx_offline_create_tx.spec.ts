import store from '@/store/tx'
import { MatrixRoomID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { room_01_user_info, user_1, user_2, user_a, user_3 } from '../mocks/mocked_user'
import { uuidgen } from '@/utils/utils'

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
    'auth/user_id': () => {
      return user_2.user_id
    }
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
  })
})
