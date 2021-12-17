import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { MatrixRoomID } from '@/models/id.model'
import { RoomUserInfo } from '@/models/user.model'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    is_graph_dirty: boolean // is the graph updated to the basic
  }>
}

export const tx_store = {
  namespaced: true,
  state (): State {
    return {
      transactions: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_tx_structure_for_room (state: State, payload: MatrixRoomID) {
      if (!state.transactions[payload]) {
        state.transactions[payload] = {
          basic: [],
          pending_approvals: [],
          graph: {
            graph: {}
          },
          is_graph_dirty: false
        }
      }
    },
    mutation_set_grouped_transactions_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      grouped_txs: GroupedTransaction[]
    }) {
      state.transactions[payload.room_id].basic = payload.grouped_txs
      state.transactions[payload.room_id].is_graph_dirty = true
    },
    mutation_set_pending_approvals_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      pending_approvals: PendingApproval[]
    }) {
      state.transactions[payload.room_id].pending_approvals = payload.pending_approvals
    },
    mutation_add_approved_grouped_transaction_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      grouped_tx: GroupedTransaction
    }) {
      state.transactions[payload.room_id].basic.push(payload.grouped_tx)
      state.transactions[payload.room_id].is_graph_dirty = true
    },
    mutation_add_pending_approval_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      pending_approval: PendingApproval
    }) {
      state.transactions[payload.room_id].pending_approvals.push(payload.pending_approval)
    },
    mutation_build_tx_graph_for_room (state: State, payload: MatrixRoomID) {
      // TODO: build the graph here
      state.transactions[payload].is_graph_dirty = false
    }
  },
  actions: <ActionTree<State, any>>{
    /*
    Transaction Creation.
    Fill the transaction parameter tx as follows:
    1. All Group IDs and TxIDs must be set to ''. These IDs are generated here.
    2. The state must be set to 'defined'.
    3. pending_approvals must be set to [] (empty).
    4. The timestamp can be set arbitrarily, since the application uses server creation time as tx creation time.
    This action then:
    1. Checks if the creation is valid. This includes both the specification validity and the implementation validity above.
    2. Creates the com.matpay.create event and sends it.
    3. Adds/Transforms this transaction to a pending approval.
    This action does not send an approval, nor performs a complete tx store refresh.
     */
    async action_create_tx_for_room ({
      state,
      commit,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
      tx: GroupedTransaction
    }) {
      const tx = payload.tx
      const room_id = payload.room_id
      // check transaction creation validity
      if (tx.group_id !== '' || tx.txs.filter(i => i.tx_id !== '').length > 0) {
        throw new Error('Implementation Error: do not fill the UUIDs!')
      }
      if (tx.state !== 'defined') {
        throw new Error('Implementation Error: set state to defined!')
      }
      if (tx.pending_approvals.length !== 0) {
        throw new Error('Implementation Error: no pending approvals, especially not itself!')
      }
      const room_users = (rootGetters['user/get_users_info_for_room'](room_id) as Array<RoomUserInfo>).map(i => i.user)
      const participating_users = tx.txs.map(t => t.to).concat([tx.from])
      for (const u of participating_users) {
        if (!room_users.includes(u)) {
          throw new Error('Implementation Error: user not in room!')
        }
      }
      const participating_users_id = participating_users.map(i => i.user_id)
      if (!participating_users_id.includes(rootGetters['auth/user_id'])) {
        throw new Error('Error: current user not part of the transaction!')
      }
      for (const a of tx.txs.map(i => i.amount)) {
        if (a <= 0) {
          throw new Error('Error: all amounts after splitting must be positive!')
        }
      }
      if (tx.description === '') {
        throw new Error('Error: description must be non-empty!')
      }
      // TODO: construct & send event
    }
  },
  getters: <GetterTree<State, any>>{
    get_grouped_transactions_for_room: (state: State) => (room_id: MatrixRoomID): GroupedTransaction[] => {
      return state.transactions[room_id].basic
    },
    get_pending_approvals_for_room: (state: State) => (room_id: MatrixRoomID) : PendingApproval[] => {
      return state.transactions[room_id].pending_approvals
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
