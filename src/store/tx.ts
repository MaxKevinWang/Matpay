import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupedTransaction, PendingApproval, TxGraph } from '@/models/transaction.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { RoomUserInfo } from '@/models/user.model'
import { uuidgen } from '@/utils/utils'
import { TxCreateEvent, TxMessageEvent, TxRejectedEvent } from '@/interface/tx_event.interface'
import axios from 'axios'
import { MatrixError } from '@/interface/error.interface'
import { RoomEventFilter } from '@/interface/filter.interface'
import { GETRoomEventsResponse } from '@/interface/api.interface'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    is_graph_dirty: boolean // is the graph updated to the basic
    rejected: Record<MatrixEventID, Set<MatrixUserID>>,
  }>,
  processed_events: Set<MatrixEventID>
}

export const tx_store = {
  namespaced: true,
  state (): State {
    return {
      transactions: {},
      processed_events: new Set()
    }
  },
  mutations: <MutationTree<State>>{
    mutation_add_processed_event (state: State, payload: MatrixEventID) {
      state.processed_events.add(payload)
    },
    mutation_init_tx_structure_for_room (state: State, payload: MatrixRoomID) {
      if (!state.transactions[payload]) {
        state.transactions[payload] = {
          basic: [],
          pending_approvals: [],
          graph: {
            graph: {}
          },
          is_graph_dirty: false,
          rejected: {}
        }
      }
    },
    mutation_add_rejected_events_for_room (state: State, payload: {
      room_id: MatrixRoomID
      rejected_events: Array<[MatrixEventID, MatrixUserID]>
    }) {
      for (const rejected_tuple of payload.rejected_events) {
        if (!state.transactions[payload.room_id].rejected[rejected_tuple[0]]) {
          state.transactions[payload.room_id].rejected[rejected_tuple[0]] = new Set()
        }
        state.transactions[payload.room_id].rejected[rejected_tuple[0]].add(rejected_tuple[1])
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
      getters,
      dispatch,
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
      const targets = tx.txs.map(t => t.to)
      const participating_users = targets.concat([tx.from])
      for (const u of participating_users) {
        if (!room_users.includes(u)) {
          throw new Error('Implementation Error: user not in room!')
        }
      }
      const participating_users_id = participating_users.map(i => i.user_id)
      if (!participating_users_id.includes(rootGetters['auth/user_id'])) {
        throw new Error('Error: current user not part of the transaction!')
      }
      if (new Set(targets).size !== targets.length) {
        throw new Error('Error: duplicate transaction target detected!')
      }
      for (const a of tx.txs.map(i => i.amount)) {
        if (a <= 0) {
          throw new Error('Error: all amounts after splitting must be positive!')
        }
      }
      if (tx.description === '') {
        throw new Error('Error: description must be non-empty!')
      }
      // Construct & send event
      const create_event = {
        from: tx.from.user_id,
        txs: tx.txs.map(i => {
          return {
            to: i.to.user_id,
            amount: i.amount,
            tx_id: ''
          }
        }),
        group_id: '',
        description: tx.description
      }
      // 1. Generate non-repeating UUIDs
      const existing_group_ids = getters.get_existing_group_ids_for_room(room_id)
      const existing_tx_ids = getters.get_existing_tx_ids_for_room(room_id)
      // UUID generation
      let group_id : GroupID = ''
      do {
        group_id = uuidgen()
      } while (existing_group_ids.has(group_id))
      create_event.group_id = group_id
      for (let i = 0; i < tx.txs.length; i++) {
        let tx_id : TxID = ''
        do {
          tx_id = uuidgen()
        } while (existing_tx_ids.has(group_id))
        create_event.txs[i].tx_id = tx_id
      }
      // Send the event
      const homeserver : string = rootGetters['auth/homeserver']
      const event_txn_id : number = await dispatch('auth/action_get_next_event_txn_id', null, { root: true })
      const response = await axios.put(`${homeserver}/_matrix/client/r0/rooms/${room_id}/send/com.matpay.create/${event_txn_id}`,
        create_event,
        { validateStatus: () => true }
      )
      if (response.status !== 200) {
        throw new Error((response.data as MatrixError).error)
      }
      // TODO: notify other stores
    },
    async action_parse_rejected_events_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      const room_id = payload.room_id
      commit('mutation_init_tx_structure_for_room', room_id)
      const rejected_events: TxRejectedEvent[] = rootGetters['rooms/get_rejected_events_for_room'](room_id)
      const room_member_ids : MatrixUserID[] = (rootGetters['rooms/get_users_info_for_room'](room_id) as RoomUserInfo[]).map(u => u.user.user_id)
      for (const rejected_event of rejected_events) {
        const array : Array<[MatrixEventID, MatrixUserID]> = []
        // parse reject event when event not processed and state_key = one user id in room
        if (!state.processed_events.has(rejected_event.event_id) && room_member_ids.includes(rejected_event.state_key)) {
          for (const event_id of rejected_event.content.events) {
            array.push([event_id, rejected_event.state_key])
          }
        }
        commit('mutation_add_rejected_events_for_room', {
          room_id: room_id,
          rejected_events: array
        })
        commit('mutation_add_processed_event', rejected_event.event_id)
      }
    },
    async action_get_and_parse_all_tx_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      const room_id = payload.room_id
      commit('mutation_init_tx_structure_for_room', room_id)
      const homeserver = rootGetters['auth/homeserver']
      let next_batch : string = rootGetters['sync/get_next_batch_id']
      const only_tx_event_filter : RoomEventFilter = {
        types: [
          'com.matpay.create',
          'com.matpay.approve',
          'com.matpay.modify',
          'com.matpay.settle'
        ]
      }
      const limit = 10
      let current_batch_tx_events : TxMessageEvent[] = []
      do {
        const response = await axios.get<GETRoomEventsResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/messages`, {
          params: {
            from: next_batch,
            dir: 'f',
            limit: limit,
            filter: JSON.stringify(only_tx_event_filter)
          },
          validateStatus: () => true
        })
        if (response.status !== 200) {
          throw new Error((response.data as unknown as MatrixError).error)
        }
        if (response.data.chunk.length !== 0) {
          current_batch_tx_events = response.data.chunk as TxMessageEvent[]
        }
        // Event processing loop starts here
        for (const tx_event of current_batch_tx_events) {
          // check if already parsed
          if (state.processed_events.has(tx_event.event_id)) {
            continue
          }
          // check if rejected
          // note: this implementation currently does not check if the user can reject it
          // that is, this allows a user to reject a tx he/she is not participating
          if (Object.keys(state.transactions[room_id].rejected).includes(tx_event.event_id)) {
            continue
          }
          // parse based on event types
          switch (tx_event.type) {
            case 'com.matpay.create': {
              const tx_event_create = tx_event as TxCreateEvent
              // no previous tx with the same group id
              const existing_group_ids : Set<GroupID> = getters.get_existing_group_ids_for_room(room_id)
              if (existing_group_ids.has(tx_event_create.content.group_id)) {
                continue
              }
              // no previous tx with the same tx id
              const existing_tx_ids : Set<TxID> = getters.get_existing_tx_ids_for_room(room_id)
              const intersect = new Set(
                tx_event_create.content.txs.map(i => i.tx_id).filter(x => existing_tx_ids.has(x))
              )
              if (intersect.size > 0) {
                continue
              }
              // all amounts non negative
              if (tx_event_create.content.txs.map(i => i.amount).filter(i => i < 0).length > 0) {
                continue
              }
              // description not blank
              if (!tx_event_create.content.description) {
                continue
              }
            }
          }
        }
        // Event processing loop ends here
        next_batch = response.data.end
      } while (current_batch_tx_events.length !== 0)
    }
  },
  getters: <GetterTree<State, any>>{
    get_grouped_transactions_for_room: (state: State) => (room_id: MatrixRoomID): GroupedTransaction[] => {
      return state.transactions[room_id].basic
    },
    get_pending_approvals_for_room: (state: State) => (room_id: MatrixRoomID) : PendingApproval[] => {
      return state.transactions[room_id].pending_approvals
    },
    get_existing_group_ids_for_room: (state: State) => (room_id: MatrixRoomID) : Set<GroupID> => {
      const existing_txs : GroupedTransaction[] = state.transactions[room_id].basic
      const existing_pending_approvals : PendingApproval[] = state.transactions[room_id].pending_approvals
      return new Set([
        ...(existing_txs.map(t => t.group_id)),
        ...(existing_pending_approvals.map(t => t.group_id))
      ])
    },
    get_existing_tx_ids_for_room: (state: State) => (room_id: MatrixRoomID) : Set<TxID> => {
      const existing_txs : GroupedTransaction[] = state.transactions[room_id].basic
      const existing_pending_approvals : PendingApproval[] = state.transactions[room_id].pending_approvals
      return new Set([
        ...(existing_txs.reduce((a: string[], b) => {
          return a.concat(b.txs.map(t => t.tx_id))
        }, [])),
        ...(existing_pending_approvals.reduce((a: string[], b) => {
          return a.concat(b.txs.map(t => t.tx_id))
        }, []))
      ])
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
