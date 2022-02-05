import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { room_01_user_info, user_1 } from '../mocks/mocked_user'
import { TxApproveEvent } from '@/interface/tx_event.interface'
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
    optimized_graph: TxGraph,
    rejected: Record<MatrixEventID, Set<MatrixUserID>>,
  }>
}

describe('Test action_approve_tx_for_room', () => {
  const action = store.actions.action_approve_tx_for_room as (context: any, payload: any) => Promise<boolean>
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
        rejected: {}
      }
    }
  }
  const rootGetters = {
    'user/get_users_info_for_room': (r: MatrixRoomID) => {
      if (r === room_id) {
        return room_01_user_info
      }
    },
    'auth/user_id': user_1.user_id
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
          rejected: {}
        }
      }
    }
  })
  it('Test pending_approval not exist', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_approval: PendingApproval = {
      event_id: 'fake_event_id',
      from: user_1,
      group_id: 'abcd',
      type: 'modify',
      approvals: {},
      description: '',
      txs: [],
      timestamp: new Date()
    }
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      approval: fake_approval
    })).rejects.toThrow(new Error('This pending approval does not exist or is already approved!'))
  })
  it('Test already approved', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    const fake_approval: PendingApproval = {
      event_id: 'fake_event_id',
      from: user_1,
      group_id: 'abcd',
      type: 'modify',
      approvals: {},
      description: '',
      txs: [],
      timestamp: new Date()
    }
    fake_approval.approvals[user_1.user_id] = true
    state.transactions.aaa.pending_approvals.push(fake_approval)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      approval: fake_approval
    })).rejects.toThrow(new Error('This pending approval has already been approved!'))
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
    const fake_approval: PendingApproval = {
      event_id: 'fake_event_id',
      from: user_1,
      group_id: 'abcd',
      type: 'modify',
      approvals: {},
      description: '',
      txs: [],
      timestamp: new Date()
    }
    state.transactions.aaa.pending_approvals.push(fake_approval)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      approval: fake_approval
    })).rejects.toThrow((resp.data as unknown as MatrixError).error)
  })
  it('Test the right case', async () => {
    let event_sent = false
    mockedAxios.put.mockImplementation(async <T>(url: string, data: T) : Promise<AxiosResponse<PUTRoomEventSendResponse>> => {
      const event_content = data as unknown as TxApproveEvent['content']
      if (event_content.event_id === 'fake_event_id') { event_sent = true }
      return {
        data: {
          event_id: 'fake_event_id'
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
    const fake_approval: PendingApproval = {
      event_id: 'fake_event_id',
      from: user_1,
      group_id: 'abcd',
      type: 'modify',
      approvals: {},
      description: '',
      txs: [],
      timestamp: new Date()
    }
    state.transactions.aaa.pending_approvals.push(fake_approval)
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      approval: fake_approval
    })).resolves.toEqual(undefined)
    await expect(event_sent).toEqual(true)
  })
})
