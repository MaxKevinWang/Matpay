import store from '@/store/tx'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { room_01_user_info, user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxApproveEvent, TxCreateEvent, TxModifyEvent, TxSettleEvent } from '@/interface/tx_event.interface'
import { uuidgen } from '@/utils/utils'
import { GroupedTransaction, PendingApproval, SimpleTransaction, TxGraph } from '@/models/transaction.model'
import { TxApprovedPlaceholder } from '@/models/chat.model'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    optimized_graph: TxGraph
  }>
}

describe('Test tx store validation actions', () => {
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
      'user/get_all_users_info_for_room': (r: MatrixRoomID) => {
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
            }
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
      it('Test Everything is fine', async () => {
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
                amount: 60,
                tx_id: fake_tx_id
              }
            ],
            group_id: fake_group_id,
            description: 'aaa'
          }
        }
        let commit_called = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          pending_approval: PendingApproval
        }) => {
          if (commit_string === 'mutation_add_pending_approval_for_room' && payload.pending_approval.description === 'aaa' && payload.pending_approval.txs[0].amount === 60 && payload.pending_approval.txs[0].tx_id === fake_tx_id) {
            commit_called = true
          }
        }
        await expect(action({
          state,
          commit: commit,
          dispatch: jest.fn(),
          getters: getters,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          tx_event: event
        }))
        expect(commit_called).toBeTruthy()
      })
      /*
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
       */
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
      /*
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
       */
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
        const existing_approval: PendingApproval = {
          event_id: 'e01',
          type: 'create',
          group_id: uuidgen(),
          txs: [],
          approvals: {
            '@test-1:dsn.tm.kit.edu': true
          },
          from: user_1,
          description: 'dfsdgs',
          timestamp: new Date()
        }
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
      it('Test committing mark user as approved fails', async () => {
        const getters = {
          get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
          get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
          get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
          get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
        }
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          user_id: MatrixUserID,
          event_id: MatrixEventID
        }) => {
          if (commit_string === 'mutation_mark_user_as_approved_for_room') {
            throw new Error()
          }
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
        const existing_approval: PendingApproval = {
          event_id: 'e01',
          type: 'create',
          group_id: uuidgen(),
          txs: [],
          approvals: {
            '@test-1:dsn.tm.kit.edu': false
          },
          from: user_1,
          description: 'dfsdgs',
          timestamp: new Date()
        }
        state.transactions[room_id].pending_approvals.push(existing_approval)
        await expect(action({
          state,
          commit: commit,
          dispatch: jest.fn(),
          getters: getters,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          tx_event: event
        })).resolves.toEqual(false)
      })
      it('Test all have approved and type of existing Pending Approval is modify', async () => {
        const getters = {
          get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
          get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
          get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
          get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
        }
        let modify_grouped_transaction = false
        let change_tx_state = false
        let remove_pending_approval = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          user_id: MatrixUserID,
          event_id: MatrixEventID,
          group_id: GroupID,
          description: string,
          txs: SimpleTransaction[],
          state: string
        }) => {
          if (commit_string === 'mutation_mark_user_as_approved_for_room') {
            const approval = state.transactions[payload.room_id].pending_approvals.filter(i => i.event_id === payload.event_id)
            approval[0].approvals[payload.user_id] = true
          } else if (commit_string === 'mutation_modify_grouped_transaction_for_room') {
            modify_grouped_transaction = true
          } else if (commit_string === 'mutation_change_tx_state_for_room') {
            change_tx_state = true
          } else if (commit_string === 'mutation_remove_pending_approval_for_room') {
            remove_pending_approval = true
          }
        }
        let dispatch_called = false
        const dispatch = (type: string, payload: {
          room_id: MatrixRoomID,
          grouped_tx: GroupedTransaction[]
        }) => {
          if (type === 'chat/action_parse_single_grouped_tx_for_room') {
            dispatch_called = true
          }
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
        const existing_approval: PendingApproval = {
          event_id: 'e01',
          type: 'modify',
          group_id: uuidgen(),
          txs: [],
          approvals: {
            '@test-1:dsn.tm.kit.edu': false,
            '@test-3:dsn.tm.kit.edu': true,
            '@test-2:dsn.tm.kit.edu': true
          },
          from: user_1,
          description: 'dfsdgs',
          timestamp: new Date()
        }
        state.transactions[room_id].pending_approvals.push(existing_approval)
        await expect(action({
          state,
          commit: commit,
          dispatch: dispatch,
          getters: getters,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          tx_event: event
        })).resolves.toEqual(true)
        expect(dispatch_called).toBe(true)
        expect(remove_pending_approval).toBe(true)
        expect(change_tx_state).toBe(true)
        expect(modify_grouped_transaction).toBe(true)
      })
      it('Test all have approved and type of existing Pending Approval is create', async () => {
        const getters = {
          get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
          get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
          get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
          get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
        }
        let modify_grouped_transaction = false
        let change_tx_state = false
        let remove_pending_approval = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          user_id: MatrixUserID,
          event_id: MatrixEventID,
          group_id: GroupID,
          description: string,
          txs: SimpleTransaction[],
          state: string
          grouped_tx: GroupedTransaction
        }) => {
          if (commit_string === 'mutation_mark_user_as_approved_for_room') {
            const approval = state.transactions[payload.room_id].pending_approvals.filter(i => i.event_id === payload.event_id)
            approval[0].approvals[payload.user_id] = true
          } else if (commit_string === 'mutation_modify_grouped_transaction_for_room') {
            modify_grouped_transaction = true
          } else if (commit_string === 'mutation_change_tx_state_for_room') {
            change_tx_state = true
          } else if (commit_string === 'mutation_remove_pending_approval_for_room') {
            remove_pending_approval = true
          } else if (commit_string === 'mutation_add_approved_grouped_transaction_for_room') {
            state.transactions[payload.room_id].basic.push(payload.grouped_tx)
          }
        }
        let dispatch_called = false
        const dispatch = (type: string, payload: {
          room_id: MatrixRoomID,
          grouped_tx: GroupedTransaction[]
        }) => {
          if (type === 'chat/action_parse_single_grouped_tx_for_room') {
            dispatch_called = true
          }
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
        const existing_approval: PendingApproval = {
          event_id: 'e01',
          type: 'create',
          group_id: uuidgen(),
          txs: [],
          approvals: {
            '@test-1:dsn.tm.kit.edu': false,
            '@test-3:dsn.tm.kit.edu': true,
            '@test-2:dsn.tm.kit.edu': true
          },
          from: user_1,
          description: 'dfsdgs',
          timestamp: new Date()
        }
        state.transactions[room_id].pending_approvals.push(existing_approval)
        await expect(action({
          state,
          commit: commit,
          dispatch: dispatch,
          getters: getters,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          tx_event: event
        })).resolves.toEqual(true)
        expect(dispatch_called).toBe(true)
        expect(remove_pending_approval).toBe(true)
        expect(change_tx_state).toBe(false)
        expect(modify_grouped_transaction).toBe(false)
        expect(state.transactions[room_id].basic).toEqual([{
          from: existing_approval.from,
          txs: existing_approval.txs,
          timestamp: existing_approval.timestamp,
          group_id: existing_approval.group_id,
          pending_approvals: [],
          description: existing_approval.description,
          state: 'approved'
        }])
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
      /*
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
       */
      /*
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
       */
    })
  })
})
