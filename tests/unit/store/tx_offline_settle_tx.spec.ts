import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { room_01_user_info, user_1, user_2, user_3, user_a, user_c } from '../mocks/mocked_user'
import { TxApproveEvent, TxCreateEvent, TxModifyEvent, TxSettleEvent } from '@/interface/tx_event.interface'
import { uuidgen } from '@/utils/utils'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { User } from '@/models/user.model'
import axios, { AxiosResponse } from 'axios'
import { MatrixError } from '@/interface/error.interface'
import { PUTRoomEventSendResponse } from '@/interface/api.interface'
import { MatrixRoomStateEvent } from '@/interface/rooms_event.interface'

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

describe('Test action_settle_for_room', () => {
  const action = store.actions.action_settle_for_room as (context: any, payload: any) => Promise<boolean>
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
  it('Test target user not in the room', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      target_user: user_c
    })).rejects.toThrow(new Error('Implementation error: target user not in room!'))
  })
  it('Test target user not in the room', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null)
    }
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      target_user: user_c
    })).rejects.toThrow(new Error('Implementation error: target user not in room!'))
  })
  it('Test settlement not permitted', async () => {
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
      get_open_balance_against_user_for_room: () => 10
    }
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      target_user: user_2
    })).rejects.toThrow(new Error('Implementation error: settlement not permitted with the target user!'))
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
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      target_user: user_2
    })).rejects.toThrow((resp.data as unknown as MatrixError).error)
  })
  it('Test the right case', async () => {
    let event_sent = false
    mockedAxios.put.mockImplementation(async <T>(url: string, data: T) : Promise<AxiosResponse<PUTRoomEventSendResponse>> => {
      const event_content = data as unknown as TxSettleEvent['content']
      if (event_content.user_id === user_2.user_id && event_content.amount === 10) { event_sent = true }
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
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
      get_open_balance_against_user_for_room: () => -10
    }
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: jest.fn(),
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa',
      target_user: user_2
    })).resolves.toEqual(undefined)
    await expect(event_sent).toEqual(true)
  })
})
