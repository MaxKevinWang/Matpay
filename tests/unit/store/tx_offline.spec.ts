import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { TxApproveEvent, TxCreateEvent, TxModifyEvent } from '@/interface/tx_event.interface'
import { test_account1, test_account2 } from '../../test_utils'
import { uuidgen } from '@/utils/utils'
import { room_01_user_info, user_1, user_2, user_3 } from '../mocks/mocked_user'
import user from '@/store/user'

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
        it('Test description empty', async () => {
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
              group_id: uuidgen(),
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
        it('Test tx with same group_id does not exist', async () => {
          const getters = {
            get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
            get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
            get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
            get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
          }
          const event1: TxCreateEvent = {
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
              group_id: uuidgen(), // TODO: How to check same group_id ?
              description: 'aaaa'
            }
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
          const event1: TxCreateEvent = {
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
                  tx_id: uuidgen() // TODO: How to check same tx_id ?
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
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
          const event1: TxCreateEvent = {
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
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
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
          const event1: TxCreateEvent = {
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
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
          }
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
          const event1: TxCreateEvent = {
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
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
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
          const event1: TxCreateEvent = {
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
                  tx_id: fake_tx_id
                }
              ],
              group_id: fake_group_id,
              description: 'aaaa'
            }
          }
          // TODO: Add Settle event
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
        console.log()
      })
    })
  })
})
