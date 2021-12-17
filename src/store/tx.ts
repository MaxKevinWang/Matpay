import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { MatrixRoomID } from '@/models/id.model'

interface State {
  transactions: Record<MatrixRoomID, Array<{
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
  }>>
}

export const tx_store = {
  namespaced: true,
  state (): State {
    return {
      transactions: {}
    }
  },
  mutations: <MutationTree<State>>{},
  actions: <ActionTree<State, any>>{},
  getters: <GetterTree<State, any>>{
    get_grouped_transactions_for_room: (state: State) => (room_id: MatrixRoomID): GroupedTransaction[] => {
      return []
    },
    get_pending_approvals_for_room: (state: State) => (room_id: MatrixRoomID) : PendingApproval[] => {
      return []
    }
  }
}

// Testing
export default {
  state: tx_store.state,
  mutations: tx_store.mutations,
  actions: tx_store.actions,
  getters: tx_store.getters
}
