import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { MatrixRoomID } from '@/models/id.model'
import { User } from '@/models/user.model'

// mocked transactions
const user_A: User = {
  user_id: 'AAAA',
  displayname: 'User A'
}
const user_B: User = {
  user_id: 'BBBB',
  displayname: 'User B'
}
const user_C: User = {
  user_id: 'CCCC',
  displayname: 'User C'
}
export const tx1: GroupedTransaction = {
  from: user_A,
  group_id: '3d93c520-b005-45c9-83d2-98d673386bcf',
  description: 'Pay pen',
  txs: [
    {
      to: user_B,
      tx_id: '2a1c141f-d274-42e2-85d9-5e343a6ebac9',
      amount: 10000
    }
  ],
  state: 'approved',
  timestamp: new Date(2021, 12, 1, 17, 50, 0),
  pending_approvals: []
}
export const tx2: GroupedTransaction = {
  from: user_A,
  group_id: '610025ac-e0ec-449c-80b4-7ef4f6f870a3',
  description: 'Pay dinner',
  txs: [
    {
      to: user_B,
      tx_id: '83cb7ad2-1351-4a67-8c97-e8c67bc84f39',
      amount: 15000
    },
    {
      to: user_B,
      tx_id: 'f32c725b-cfa5-4f05-824a-ff65c73c11e9',
      amount: 12000
    }
  ],
  state: 'approved',
  timestamp: new Date(2021, 12, 1, 18, 30, 0),
  pending_approvals: []
}
export const tx3: GroupedTransaction = {
  from: user_C,
  group_id: '5477f4ab-f41a-4528-8952-c853cdd533f8',
  description: 'Drink',
  txs: [
    {
      to: user_B,
      tx_id: '5f6629c5-4494-434b-aebe-134728dfd4ab',
      amount: 13000
    },
    {
      to: user_A,
      tx_id: 'cc24ff8f-6860-4891-bc68-a373a06b00e7',
      amount: 18000
    }
  ],
  state: 'defined',
  timestamp: new Date(2021, 12, 1, 19, 30, 0),
  pending_approvals: []
}
export const pd1 : PendingApproval = {
  event_id: 'XXX',
  type: 'modify',
  approvals: {
    AAAA: false,
    BBBB: false,
    CCCC: true
  },
  group_id: tx3.group_id,
  from: user_C,
  description: 'Drink',
  txs: [
    {
      to: user_B,
      tx_id: '5f6629c5-4494-434b-aebe-134728dfd4ab',
      amount: 15000
    },
    {
      to: user_A,
      tx_id: 'cc24ff8f-6860-4891-bc68-a373a06b00e7',
      amount: 18000
    }
  ],
  timestamp: new Date(2021, 12, 1, 20, 0, 0)
}
export const pd2 : PendingApproval = {
  event_id: 'YYY',
  type: 'create',
  approvals: {
    AAAA: false,
    BBBB: true,
    CCCC: false
  },
  description: 'Hotel fee',
  from: user_B,
  group_id: 'c8a39efa-5118-4246-ac99-ef96b66596a6',
  txs: [
    {
      to: user_C,
      tx_id: '15b756d6-424a-42e5-aa91-6e6a10c0ea69',
      amount: 200000
    },
    {
      to: user_A,
      tx_id: 'eeca46cb-c17b-49e7-b6e5-49e08b5475c9',
      amount: 300000
    }
  ],
  timestamp: new Date(2021, 12, 1, 22, 0, 0)
}
tx3.pending_approvals = [pd1]

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
      if (room_id === '!YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu') {
        return [tx2, tx3, tx1]
      } else {
        return []
      }
    },
    get_pending_approvals_for_room: (state: State) => (room_id: MatrixRoomID) : PendingApproval[] => {
      if (room_id === '!YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu') {
        return [pd1, pd2]
      } else {
        return []
      }
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
