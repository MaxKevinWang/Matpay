import store from '@/store/tx'
import { MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { room_02_user_info, user_a, user_b, user_bbb, user_c } from '../mocks/mocked_user'
import { TxSettleEvent } from '@/interface/tx_event.interface'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { User } from '@/models/user.model'
import axios, { AxiosResponse } from 'axios'
import { graph3_optimized } from '../mocks/mocked_graph'
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

describe('Test  action_early_leave_settlement_for_room', () => {
  const action = store.actions.action_early_leave_settlement_for_room as (context: any, payload: any) => Promise<boolean>
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
        return room_02_user_info
      }
    },
    'auth/user_id': user_c.user_id
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
  it('Test if settlement is called when aaa leave', async () => {
    let settle_a = false
    let settle_b = false
    const dispatch = async (action_string: string, payload: {
      room_id: MatrixRoomID
      target_user: User
    }) => {
      if (action_string === 'action_settle_for_room') {
        if (payload.target_user === user_a) {
          settle_a = true
        } else if (payload.target_user === user_b) {
          settle_b = true
        }
      }
    }
    const getters = {
      get_grouped_transactions_for_room: store.getters.get_grouped_transactions_for_room(state, null, null, null),
      get_pending_approvals_for_room: store.getters.get_pending_approvals_for_room(state, null, null, null),
      get_existing_group_ids_for_room: store.getters.get_existing_group_ids_for_room(state, null, null, null),
      get_existing_tx_ids_for_room: store.getters.get_existing_tx_ids_for_room(state, null, null, null),
      get_open_balance_against_user_for_room: store.getters.get_open_balance_against_user_for_room(state, null, null, rootGetters)
    }
    let event_sent = false
    mockedAxios.put.mockImplementation(async <T>(url: string, data: T) : Promise<AxiosResponse<PUTRoomEventSendResponse>> => {
      const event_content = data as unknown as TxSettleEvent['content']
      if (event_content.amount === 10 && event_content.user_id === user_bbb.user_id) { event_sent = true }
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
    state.transactions.aaa.optimized_graph = graph3_optimized
    await expect(action({
      state,
      commit: jest.fn(),
      dispatch: dispatch,
      getters: getters,
      rootGetters: rootGetters
    }, {
      room_id: 'aaa'
    })).resolves.toEqual(undefined)
    await expect(settle_b).toEqual(true)
    await expect(settle_a).toEqual(true)
  })
})
