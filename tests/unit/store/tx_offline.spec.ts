import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, SimpleTransaction, TxGraph } from '@/models/transaction.model'
import { TxApproveEvent, TxCreateEvent, TxModifyEvent, TxSettleEvent } from '@/interface/tx_event.interface'
import { test_account1, test_account2 } from '../../test_utils'
import { uuidgen } from '@/utils/utils'
import {
  room_01_user_info,
  user_1,
  user_2,
  user_3,
  user_a,
  user_aaa,
  user_b,
  user_bbb, user_c,
  user_ccc, user_d, user_e, user_f
} from '../mocks/mocked_user'
import user from '@/store/user'
import { Room } from '@/models/room.model'
import {
  graph1_optimized,
  graph1_unoptimized,
  graph2_optimized,
  graph2_unoptimized, graph3_optimized,
  graph3_unoptimized, graph4_optimized, graph4_unoptimized
} from '../mocks/mocked_graph'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph,
    optimized_graph: TxGraph,
    is_graph_dirty: boolean, // if both graphs are updated with basic
    rejected: Record<MatrixEventID, Set<MatrixUserID>>,
  }>
}

describe('Test transaction Vuex store offline', () => {
  describe('Test store mutation', () => {
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
          },
          is_graph_dirty: false,
          rejected: {}
        }
      }
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
            },
            is_graph_dirty: false,
            rejected: {}
          }
        }
      }
    })
    it('Test mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      state.transactions = {}
      mutation(state, 'aaa')
      expect(state.transactions.aaa.basic).toEqual([])
      expect(state.transactions.aaa.pending_approvals).toEqual([])
      expect(state.transactions.aaa.is_graph_dirty).toEqual(false)
      expect(state.transactions.aaa.graph.graph).toEqual({})
      expect(state.transactions.aaa.rejected).toEqual({})
    })
    it('Test mutation_add_rejected_events_for_room', function () {
      const mutation = store.mutations.mutation_add_rejected_events_for_room
      const fake_rejected_events = [['ep01', user_1.user_id], ['ep01', user_2.user_id]]
      mutation(state, { room_id: 'aaa', rejected_events: fake_rejected_events })
      expect(state.transactions.aaa.rejected.ep01).toEqual(new Set([user_1.user_id, user_2.user_id]))
    })
    it('Test mutation_add_approved_grouped_transaction_for_room', function () {
      const mutation = store.mutations.mutation_add_approved_grouped_transaction_for_room
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: uuidgen(),
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      mutation(state, { room_id: 'aaa', grouped_tx: fake_grouped_tx })
      expect(state.transactions.aaa.basic[0]).toEqual(fake_grouped_tx)
    })
    it('Test mutation_add_pending_approval_for_room', function () {
      const mutation = store.mutations.mutation_add_pending_approval_for_room
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        from: user_1,
        group_id: uuidgen(),
        type: 'create',
        txs: [],
        description: '',
        approvals: {},
        timestamp: new Date()
      }
      mutation(state, { room_id: 'aaa', pending_approval: fake_pending_approval })
      expect(state.transactions.aaa.pending_approvals[0]).toEqual(fake_pending_approval)
    })
    it('Test mutation_mark_user_as_approved_for_room', function () {
      const mutation = store.mutations.mutation_mark_user_as_approved_for_room
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        from: user_1,
        group_id: uuidgen(),
        type: 'create',
        txs: [],
        description: '',
        approvals: {},
        timestamp: new Date()
      }
      expect(() => mutation(state, { room_id: 'aaa', user_id: user_1.user_id, event_id: 'e01' })).toThrow('Invalid event ID!')
      state.transactions.aaa.pending_approvals.push(fake_pending_approval)
      mutation(state, { room_id: 'aaa', user_id: user_1.user_id, event_id: 'e01' })
      expect(state.transactions.aaa.pending_approvals[0].approvals[user_1.user_id]).toEqual(true)
    })
    it('Test mutation_remove_pending_approval_for_room', function () {
      const mutation = store.mutations.mutation_remove_pending_approval_for_room
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        from: user_1,
        group_id: uuidgen(),
        type: 'create',
        txs: [],
        description: '',
        approvals: {},
        timestamp: new Date()
      }
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: uuidgen(),
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: [{
          event_id: 'e01',
          from: user_1,
          group_id: uuidgen(),
          type: 'create',
          txs: [],
          description: '',
          approvals: {},
          timestamp: new Date()
        }]
      }
      expect(() => mutation(state, { room_id: 'aaa', event_id: 'e01' })).toThrow('Invalid event ID!')
      state.transactions.aaa.basic.push(fake_grouped_tx)
      state.transactions.aaa.pending_approvals.push(fake_pending_approval)
      mutation(state, { room_id: 'aaa', event_id: 'e01' })
      expect(state.transactions.aaa.pending_approvals.length).toEqual(0)
      expect(state.transactions.aaa.basic[0].pending_approvals.length).toEqual(0)
    })
    it('Test mutation_modify_grouped_transaction_for_room', function () {
      const mutation = store.mutations.mutation_modify_grouped_transaction_for_room
      const fake_group_id = uuidgen()
      const fake_tx_id = uuidgen()
      const fake_txs = new Array([user_1, fake_tx_id, 10])
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id,
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      expect(() => mutation(state, { room_id: 'aaa', group_id: uuidgen(), description: 'aaaa', txs: fake_txs })).toThrow('Invalid group ID!')
      state.transactions.aaa.basic.push(fake_grouped_tx)
      expect(() => mutation(state, { room_id: 'aaa', group_id: fake_group_id })).toThrow('Nothing to modify!')
      mutation(state, { room_id: 'aaa', group_id: fake_group_id, description: 'aaaa', txs: fake_txs })
      expect(state.transactions.aaa.basic[0].description).toEqual('aaaa')
      expect(state.transactions.aaa.basic[0].txs).toEqual(fake_txs)
    })
    it('Test mutation_change_tx_state_for_room', function () {
      const mutation = store.mutations.mutation_change_tx_state_for_room
      const fake_group_id = uuidgen()
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id,
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      expect(() => mutation(state, { room_id: 'aaa', group_id: uuidgen(), state: 'frozen' })).toThrow('Invalid group ID!')
      state.transactions.aaa.basic.push(fake_grouped_tx)
      mutation(state, { room_id: 'aaa', group_id: fake_group_id, state: 'frozen' })
      expect(state.transactions.aaa.basic[0].state).toEqual('frozen')
    })
    it('Test mutation_build_tx_graph_for_room', function () {
      const mutation = store.mutations.mutation_build_tx_graph_for_room
      const fake_group_id = uuidgen()
      const fake_grouped_tx1: GroupedTransaction = {
        from: user_aaa,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_bbb,
            tx_id: uuidgen(),
            amount: 30
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx2: GroupedTransaction = {
        from: user_bbb,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_ccc,
            tx_id: uuidgen(),
            amount: 20
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx3: GroupedTransaction = {
        from: user_ccc,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_aaa,
            tx_id: uuidgen(),
            amount: 20
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx4: GroupedTransaction = {
        from: user_a,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_b,
            tx_id: uuidgen(),
            amount: 50
          },
          {
            to: user_c,
            tx_id: uuidgen(),
            amount: 50
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx5: GroupedTransaction = {
        from: user_b,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_d,
            tx_id: uuidgen(),
            amount: 100
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx6: GroupedTransaction = {
        from: user_c,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_e,
            tx_id: uuidgen(),
            amount: 100
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx7: GroupedTransaction = {
        from: user_d,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_a,
            tx_id: uuidgen(),
            amount: 25
          },
          {
            to: user_f,
            tx_id: uuidgen(),
            amount: 75
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx8: GroupedTransaction = {
        from: user_a,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_b,
            tx_id: uuidgen(),
            amount: 10
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx9: GroupedTransaction = {
        from: user_b,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_c,
            tx_id: uuidgen(),
            amount: 20
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx10: GroupedTransaction = {
        from: user_c,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_a,
            tx_id: uuidgen(),
            amount: 20
          },
          {
            to: user_d,
            tx_id: uuidgen(),
            amount: 30
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx11: GroupedTransaction = {
        from: user_d,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_b,
            tx_id: uuidgen(),
            amount: 30
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx12: GroupedTransaction = {
        from: user_a,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_c,
            tx_id: uuidgen(),
            amount: 10
          },
          {
            to: user_e,
            tx_id: uuidgen(),
            amount: 20
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx13: GroupedTransaction = {
        from: user_b,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_a,
            tx_id: uuidgen(),
            amount: 5
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx14: GroupedTransaction = {
        from: user_c,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_d,
            tx_id: uuidgen(),
            amount: 30
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx15: GroupedTransaction = {
        from: user_d,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_c,
            tx_id: uuidgen(),
            amount: 5
          },
          {
            to: user_e,
            tx_id: uuidgen(),
            amount: 20
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_grouped_tx16: GroupedTransaction = {
        from: user_e,
        group_id: fake_group_id,
        state: 'approved',
        txs: [
          {
            to: user_c,
            tx_id: uuidgen(),
            amount: 10
          },
          {
            to: user_b,
            tx_id: uuidgen(),
            amount: 5
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      state.transactions.aaa.basic.push(fake_grouped_tx1, fake_grouped_tx2, fake_grouped_tx3)
      state.transactions.aaa.is_graph_dirty = true
      state.transactions.aaa.graph = graph1_unoptimized
      mutation(state, 'aaa')
      expect(state.transactions.aaa.optimized_graph).toEqual(graph1_optimized)
      state.transactions.aaa.basic = []
      state.transactions.aaa.basic.push(fake_grouped_tx4, fake_grouped_tx5, fake_grouped_tx6, fake_grouped_tx7)
      state.transactions.aaa.is_graph_dirty = true
      state.transactions.aaa.graph = graph2_unoptimized
      mutation(state, 'aaa')
      expect(state.transactions.aaa.optimized_graph).toEqual(graph2_optimized)
      state.transactions.aaa.basic = []
      state.transactions.aaa.basic.push(fake_grouped_tx8, fake_grouped_tx9, fake_grouped_tx10, fake_grouped_tx11)
      state.transactions.aaa.is_graph_dirty = true
      state.transactions.aaa.graph = graph3_unoptimized
      mutation(state, 'aaa')
      expect(state.transactions.aaa.optimized_graph).toEqual(graph3_optimized)
      state.transactions.aaa.basic = []
      state.transactions.aaa.basic.push(fake_grouped_tx12, fake_grouped_tx13, fake_grouped_tx14, fake_grouped_tx15, fake_grouped_tx16)
      state.transactions.aaa.is_graph_dirty = true
      state.transactions.aaa.graph = graph4_unoptimized
      mutation(state, 'aaa')
      expect(state.transactions.aaa.optimized_graph).toEqual(graph4_optimized)
    })
  })
  describe('Test getters', () => {
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
          },
          is_graph_dirty: false,
          rejected: {}
        }
      }
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
            },
            is_graph_dirty: false,
            rejected: {}
          }
        }
      }
    })
    it('Test getter get_grouped_transactions_for_room', function () {
      const getter = store.getters.get_grouped_transactions_for_room(state, null, null, null)
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: uuidgen(),
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      state.transactions.aaa.basic.push(fake_grouped_tx)
      expect(getter('aaa')).toEqual(state.transactions.aaa.basic)
    })
    it('Test getter get_pending_approvals_for_room', function () {
      const getter = store.getters.get_pending_approvals_for_room(state, null, null, null)
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        from: user_1,
        group_id: uuidgen(),
        type: 'create',
        txs: [],
        description: '',
        approvals: {},
        timestamp: new Date()
      }
      state.transactions.aaa.pending_approvals.push(fake_pending_approval)
      expect(getter('aaa')).toEqual(state.transactions.aaa.pending_approvals)
    })
    it('Test getter get_existing_group_ids_for_room', function () {
      const getter = store.getters.get_existing_group_ids_for_room(state, null, null, null)
      const fake_group_id1 = uuidgen()
      const fake_group_id2 = uuidgen()
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        from: user_1,
        group_id: fake_group_id2,
        type: 'create',
        txs: [],
        description: '',
        approvals: {},
        timestamp: new Date()
      }
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id1,
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      state.transactions.aaa.basic.push(fake_grouped_tx)
      state.transactions.aaa.pending_approvals.push(fake_pending_approval)
      expect(getter('aaa')).toEqual(new Set([fake_group_id1, fake_group_id2]))
    })
    it('Test getter get_existing_tx_ids_for_room', function () {
      const getter = store.getters.get_existing_tx_ids_for_room(state, null, null, null)
      const fake_group_id1 = uuidgen()
      const fake_group_id2 = uuidgen()
      const fake_tx_id1 = uuidgen()
      const fake_tx_id2 = uuidgen()
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        from: user_1,
        group_id: fake_group_id2,
        type: 'create',
        txs: [
          {
            to: user_a,
            tx_id: fake_tx_id2,
            amount: 25
          }
        ],
        description: '',
        approvals: {},
        timestamp: new Date()
      }
      const fake_grouped_tx: GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id1,
        state: 'approved',
        txs: [
          {
            to: user_a,
            tx_id: fake_tx_id1,
            amount: 25
          }
        ],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      state.transactions.aaa.basic.push(fake_grouped_tx)
      state.transactions.aaa.pending_approvals.push(fake_pending_approval)
      expect(getter('aaa')).toEqual(new Set([fake_tx_id1, fake_tx_id2]))
    })
    it('Test getter get_open_balance_against_user_for_room', function () {
      const getter = store.getters.get_open_balance_against_user_for_room(state, null, null, null)
      state.transactions.aaa.is_graph_dirty = true
      expect(() => getter('aaa', user_1, user_2)).toThrow('Graph is not clean. Call corresponding actions first')
      state.transactions.aaa.optimized_graph = graph1_optimized
      state.transactions.aaa.is_graph_dirty = false
      expect(getter('aaa', user_aaa.user_id, user_bbb.user_id)).toEqual(-10)
      expect(getter('aaa', user_bbb.user_id, user_aaa.user_id)).toEqual(10)
    })
    it('Test getter get_total_open_balance_for_user_for_room', function () {
      const getter = store.getters.get_total_open_balance_for_user_for_room(state, null, null, null)
      state.transactions.aaa.is_graph_dirty = true
      expect(() => getter('aaa', user_a.user_id)).toThrow('Graph is not clean. Call corresponding actions first')
      state.transactions.aaa.optimized_graph = graph2_optimized
      state.transactions.aaa.is_graph_dirty = false
      expect(getter('aaa', user_a.user_id)).toEqual(-75)
      expect(getter('aaa', user_b.user_id)).toEqual(-50)
    })
  })
  describe('Test actions', () => {
    describe('Test action parse single event', () => {
      const action = store.actions.action_parse_single_tx_event_for_room as (context: any, payload: any) => Promise<boolean>
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
            },
            is_graph_dirty: false,
            rejected: {}
          }
        }
      }
      const rootGetters = {
        'user/get_users_info_for_room': (r: MatrixRoomID) => {
          if (r === room_id) {
            return room_01_user_info
          }
        }
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
              },
              is_graph_dirty: false,
              rejected: {}
            }
          }
        }
      })
      describe('Test parse create event', () => {
        it('Test invalid UUID --groupid', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: 'aaa', // invalid UUID,
              description: 'AAA'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })

        it('Test invalid UUID --txID', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: 'wrongTxID'
                }
              ],
              group_id: uuidgen(), // invalid UUID,
              description: 'AAA'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test repeating grouped UUID', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const repeated_id = uuidgen()
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: repeated_id,
              description: 'AAA'
            }
          }
          state.transactions[room_id].pending_approvals.push({
            event_id: 'BBB',
            type: 'create',
            group_id: repeated_id,
            txs: [],
            approvals: {},
            from: user_1,
            description: 'dfsdgs',
            timestamp: new Date()
          })
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test description empty', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: uuidgen(),
              description: ''
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test Amount < 0', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: -5,
                  tx_id: uuidgen()
                }
              ],
              group_id: uuidgen(),
              description: 'aaaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test to field contains repeating user', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                },
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: uuidgen(),
              description: 'aaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Transaction does not contain the sender', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_3.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: uuidgen(),
              description: 'aaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test repeating tx_id', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: 'repeated'
                }
              ],
              group_id: uuidgen(),
              description: 'aaa'
            }
          }
          state.transactions[room_id].pending_approvals.push({
            event_id: 'BBB',
            type: 'create',
            group_id: uuidgen(),
            txs: [
              {
                to: user_3,
                amount: 100,
                tx_id: 'repeated'
              }
            ],
            approvals: {},
            from: user_1,
            description: 'dfsdgs',
            timestamp: new Date()
          })
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test participants not in this room', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const user_not_in_room = {
            user_id: '@test-4:dsn.tm.kit.edu',
            displayname: 'DSN Test Account out of any room'
          }
          const event: TxCreateEvent = {
            type: 'com.matpay.create',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              from: user_1.user_id,
              txs: [
                {
                  to: user_not_in_room.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: uuidgen(),
              description: 'aaaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
      })
      describe('Test parse modify event', () => {
        it('Test invalid UUID', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: 'aaa', // invalid UUID,
              description: 'AAA'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: 'aaa',
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test invalid UUID for tx_id', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: 'aaa' // invalid UUID
                }
              ],
              group_id: uuidgen(),
              description: 'AAA'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: 'aaa',
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test description empty', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'approved',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'dfsdgs',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: '' // empty description
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test negative Amount', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'approved',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'aaaa',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: -5, // negative amount
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test tx with same group_id does not exist', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e02',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: uuidgen(),
              description: 'AAA'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test different tx_id', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'approved',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'aaaa',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_2.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e02',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: uuidgen()
                }
              ],
              group_id: fake_group_id,
              description: 'aaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test To Field Modification', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'approved',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'aaaa',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e02',
            content: {
              txs: [
                {
                  to: user_3.user_id,
                  amount: 50,
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test Sender is not Participant', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'approved',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'aaaa',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_3.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e02',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'AA'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test Nothing changed', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'approved',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'aaaa',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_2.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e02',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 50,
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test Tx has been Frozen', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const fake_group_id = uuidgen()
          const fake_tx_id = uuidgen()
          state.transactions[room_id].basic.push({
            state: 'frozen',
            group_id: fake_group_id,
            txs: [
              {
                to: user_2,
                amount: 50,
                tx_id: fake_tx_id
              }
            ],
            pending_approvals: [],
            from: user_1,
            description: 'aaaa',
            timestamp: new Date()
          })
          const event: TxModifyEvent = {
            type: 'com.matpay.modify',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e02',
            content: {
              txs: [
                {
                  to: user_2.user_id,
                  amount: 500,
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'Aaa'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
      })
      describe('Test parse approve event', () => {
        it('Test without data event with same event ID', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxApproveEvent = {
            type: 'com.matpay.approve',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              event_id: 'e01'
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Test event ID in the rejected', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxApproveEvent = {
            type: 'com.matpay.approve',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              event_id: 'e01'
            }
          }
          state.transactions[room_id].pending_approvals.push({
            event_id: 'e01',
            type: 'create',
            group_id: uuidgen(),
            txs: [],
            approvals: {},
            from: user_1,
            description: 'dfsdgs',
            timestamp: new Date()
          })
          state.transactions[room_id].rejected.e01 = new Set<MatrixUserID>()
          state.transactions[room_id].rejected.e01.add(user_1.user_id)
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('One user approves twice', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event: TxApproveEvent = {
            type: 'com.matpay.approve',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              event_id: 'e01'
            }
          }
          const existing_approval : PendingApproval = {
            event_id: 'e01',
            type: 'create',
            group_id: uuidgen(),
            txs: [],
            approvals: {},
            from: user_1,
            description: 'dfsdgs',
            timestamp: new Date()
          }
          existing_approval.approvals[user_1.user_id] = true
          state.transactions[room_id].pending_approvals.push(existing_approval)
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
      })
      describe('Test parse settle event', () => {
        it('User with given user_id is not in the room', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const user_not_in_room = {
            user_id: '@test-4:dsn.tm.kit.edu',
            displayname: 'DSN Test Account out of any room'
          }
          state.transactions[room_id].basic.push({
            from: user_not_in_room,
            state: 'approved',
            group_id: uuidgen(),
            txs: [
              {
                to: user_1,
                tx_id: uuidgen(),
                amount: 50
              }
            ],
            description: 'dfsdgs',
            timestamp: new Date(),
            pending_approvals: []
          })
          const event: TxSettleEvent = {
            type: 'com.matpay.settle',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              user_id: '@test-4:dsn.tm.kit.edu',
              event_id: 'e01',
              amount: 50
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Sending user is on the receiving side', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
            get_open_balance_against_user_for_room: store.getters.get_open_balance_against_user_for_room(state, null, null, null),
            get_total_open_balance_for_user_for_room: store.getters.get_total_open_balance_for_user_for_room(state, null, null, null)
          }
          state.transactions[room_id].basic.push({
            from: user_1,
            state: 'approved',
            group_id: uuidgen(),
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 50
              }
            ],
            description: 'dfsdgs',
            timestamp: new Date(),
            pending_approvals: []
          })
          const event: TxSettleEvent = {
            type: 'com.matpay.settle',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              user_id: user_2.user_id,
              event_id: 'e01',
              amount: 50
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('Amount < 0', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
            get_open_balance_against_user_for_room: store.getters.get_open_balance_against_user_for_room(state, null, null, null),
            get_total_open_balance_for_user_for_room: store.getters.get_total_open_balance_for_user_for_room(state, null, null, null)
          }
          state.transactions[room_id].basic.push({
            from: user_2,
            state: 'approved',
            group_id: uuidgen(),
            txs: [
              {
                to: user_1,
                tx_id: uuidgen(),
                amount: -5
              }
            ],
            description: 'dfsdgs',
            timestamp: new Date(),
            pending_approvals: []
          })
          const event: TxSettleEvent = {
            type: 'com.matpay.settle',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              user_id: user_2.user_id,
              event_id: 'e01',
              amount: -5
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('There is no previous event', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
            get_open_balance_against_user_for_room: store.getters.get_open_balance_against_user_for_room(state, null, null, null),
            get_total_open_balance_for_user_for_room: store.getters.get_total_open_balance_for_user_for_room(state, null, null, null)
          }
          const event: TxSettleEvent = {
            type: 'com.matpay.settle',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              user_id: user_2.user_id,
              event_id: 'e01',
              amount: 20
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
        it('amount field smaller than open balance', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
            get_open_balance_against_user_for_room: store.getters.get_open_balance_against_user_for_room(state, null, null, null),
            get_total_open_balance_for_user_for_room: store.getters.get_total_open_balance_for_user_for_room(state, null, null, null)
          }
          state.transactions[room_id].basic.push({
            from: user_2,
            state: 'approved',
            group_id: uuidgen(),
            txs: [
              {
                to: user_1,
                tx_id: uuidgen(),
                amount: 50
              }
            ],
            description: 'dfsdgs',
            timestamp: new Date(),
            pending_approvals: []
          })
          const event: TxSettleEvent = {
            type: 'com.matpay.settle',
            sender: user_1.user_id,
            room_id: room_id,
            origin_server_ts: 60000,
            event_id: 'e01',
            content: {
              user_id: user_2.user_id,
              event_id: 'e01',
              amount: 20
            }
          }
          await expect(action({
            state,
            commit: jest.fn(),
            dispatch: jest.fn(),
            getters: getters,
            rootGetters: rootGetters
          }, {
            room_id: room_id,
            tx_event: event
          })).resolves.toEqual(false)
        })
      })
    })
  })
})
