import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { TxCreateEvent, TxModifyEvent } from '@/interface/tx_event.interface'
import { test_account1, test_account2 } from '../../test_utils'
import { uuidgen } from '@/utils/utils'
import { room_01_user_info, user_1, user_2 } from '../mocks/mocked_user'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    is_graph_dirty: boolean // is the graph updated to the basic
    rejected: Record<MatrixEventID, Set<MatrixUserID>>,
  }>
}

describe('Test transaction Vuex store offline', () => {
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
              is_graph_dirty: false,
              rejected: {}
            }
          }
        }
      })
      describe('Test parse create event', () => {
        it('Test invalid UUID', async () => {
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
      })
      describe('Test parse approve event', () => {
        console.log()
      })
      describe('Test parse settle event', () => {
        console.log()
      })
    })
  })
})
