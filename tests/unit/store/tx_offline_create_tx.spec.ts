import store from '@/store/tx'
import { MatrixRoomID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { room_01_user_info } from '../mocks/mocked_user'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    optimized_graph: TxGraph
  }>
}

describe('Test action_create_tx_for_room', () => {
  const action = store.actions.action_create_tx_for_room
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
  describe('Test against implementation errors', () => {
    it('Test UUID´s are filled', async () => {
      // To be done
    })
  })
})
