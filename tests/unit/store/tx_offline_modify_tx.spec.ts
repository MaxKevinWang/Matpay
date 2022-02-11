import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { room_01_user_info, user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxModifyEvent } from '@/interface/tx_event.interface'
import { uuidgen } from '@/utils/utils'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import axios, { AxiosResponse } from 'axios'
import { MatrixError } from '@/interface/error.interface'
import { PUTRoomEventSendResponse } from '@/interface/api.interface'

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

describe('Test action_modify_tx_for_room', () => {
  const action = store.actions.action_modify_tx_for_room as (context: any, payload: any) => Promise<boolean>
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
  it('Test no corresponding tx in tx_old', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
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
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: uuidgen(),
      state: 'approved',
      txs: [],
      description: '1',
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
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: only modify existing tx!'))
  })
  it('Test tx_old is settlement', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'settlement',
      txs: [],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: cannot modify settlement txs!'))
  })
  it('Test tx_old different id', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: uuidgen(),
      state: 'approved',
      txs: [],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: keep the group_id same!'))
  })
  it('Test no corresponding single tx in tx_old', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: uuidgen(),
        amount: 10
      }],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: every tx_id must have a corresponding one in the old tx'))
  })
  it('Test nothing changed', async () => {
    const resp = {
      status: 200,
      data: ''
    }
    mockedAxios.put.mockImplementation(() => Promise.resolve(resp))
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_tx_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: something must be changed in a modification'))
  })
  it('Test from user are same', async () => {
    const resp = {
      status: 200,
      data: ''
    }
    mockedAxios.put.mockImplementation(() => Promise.resolve(resp))
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_tx_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_2,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: the from & to users should stay the same'))
  })
  it('Test to user are same', async () => {
    const resp = {
      status: 200,
      data: ''
    }
    mockedAxios.put.mockImplementation(() => Promise.resolve(resp))
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_tx_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_3,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow(new Error('Implementation error: the from & to users should stay the same'))
  })
  it('Test Network error', async () => {
    const resp = {
      status: 400,
      data: ''
    }
    mockedAxios.put.mockImplementation(() => Promise.resolve(resp))
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_tx_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).rejects.toThrow((resp.data as unknown as MatrixError).error)
  })
  it('Test no error', async () => {
    let event_sent = false
    mockedAxios.put.mockImplementation(async <T>(url: string, data: T) : Promise<AxiosResponse<PUTRoomEventSendResponse>> => {
      const event_content = data as unknown as TxModifyEvent['content']
      if (event_content.description === '1' && event_content.txs[0].amount === 20) { event_sent = true }
      return {
        data: {
          event_id: 'aaa'
        },
        status: 200,
        config: {},
        headers: {},
        statusText: 'OK'
      }
    })
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_group_id = uuidgen()
    const fake_tx_id = uuidgen()
    const fake_grouped_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 10
      }],
      description: '',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_grouped_tx2: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: fake_tx_id,
        amount: 20
      }],
      description: '1',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    state.transactions.aaa.basic.push(fake_grouped_tx1)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      tx_old: fake_grouped_tx1,
      tx_new: fake_grouped_tx2
    })).resolves.toEqual(undefined)
    await expect(event_sent).toEqual(true)
  })
})
