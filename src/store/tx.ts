import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupedTransaction, PendingApproval, SimpleTransaction, TxGraph } from '@/models/transaction.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { RoomUserInfo, User } from '@/models/user.model'
import { uuidgen } from '@/utils/utils'
import {
  TxApproveEvent,
  TxCreateEvent,
  TxMessageEvent,
  TxModifyEvent,
  TxRejectedEvent,
  TxSettleEvent
} from '@/interface/tx_event.interface'
import axios from 'axios'
import { MatrixError } from '@/interface/error.interface'
import { validate as uuidValidate } from 'uuid'
import { PUTRoomEventSendResponse } from '@/interface/api.interface'

interface State {
  transactions: Record<MatrixRoomID, {
    basic: GroupedTransaction[],
    pending_approvals: PendingApproval[],
    graph: TxGraph
    is_graph_dirty: boolean // is the graph updated to the basic
    rejected: Record<MatrixEventID, Set<MatrixUserID>>,
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
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
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
    },
    mutation_mark_user_as_approved_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      user_id: MatrixUserID,
      event_id: MatrixEventID
    }) {
      const approval = state.transactions[payload.room_id].pending_approvals.filter(i => i.event_id === payload.event_id)
      if (approval.length !== 1) {
        throw new Error('Invalid event ID!')
      }
      approval[0].approvals[payload.user_id] = true
    },
    mutation_remove_pending_approval_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      event_id: MatrixEventID
    }) {
      const to_delete = state.transactions[payload.room_id].pending_approvals.find(
        i => i.event_id === payload.event_id
      )
      if (to_delete) {
        const index = state.transactions[payload.room_id].pending_approvals.indexOf(to_delete)
        state.transactions[payload.room_id].pending_approvals.splice(index, 1)
        // also delete all references in transactions
        for (const grouped_tx of state.transactions[payload.room_id].basic) {
          for (const ap of grouped_tx.pending_approvals) {
            if (ap.event_id === payload.event_id) {
              const index_ap = grouped_tx.pending_approvals.indexOf(ap)
              grouped_tx.pending_approvals.splice(index_ap, 1)
            }
          }
        }
      } else {
        throw new Error('Invalid event ID!')
      }
    },
    mutation_modify_grouped_transaction_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      group_id: GroupID,
      description?: string,
      txs?: SimpleTransaction[]
    }) {
      if (!payload.description && !payload.txs) {
        throw new Error('Nothing to modify!')
      }
      const tx = state.transactions[payload.room_id].basic.filter(i => i.group_id === payload.group_id)
      if (tx.length !== 1) {
        throw new Error('Invalid group ID!')
      }
      if (payload.description) {
        tx[0].description = payload.description
      }
      if (payload.txs) {
        tx[0].txs = payload.txs
      }
    },
    mutation_change_tx_state_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      group_id: GroupID,
      state: 'defined' | 'approved' | 'frozen' | 'settlement'
    }) {
      const tx = state.transactions[payload.room_id].basic.filter(i => i.group_id === payload.group_id)
      if (tx.length !== 1) {
        throw new Error('Invalid group ID!')
      }
      tx[0].state = payload.state
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
        if (!(room_users.map(i => i.user_id)).includes(u.user_id)) {
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
      let group_id: GroupID = ''
      do {
        group_id = uuidgen()
      } while (existing_group_ids.has(group_id))
      create_event.group_id = group_id
      for (let i = 0; i < tx.txs.length; i++) {
        let tx_id: TxID = ''
        do {
          tx_id = uuidgen()
        } while (existing_tx_ids.has(group_id))
        create_event.txs[i].tx_id = tx_id
      }
      // Send the event
      const homeserver: string = rootGetters['auth/homeserver']
      const event_txn_id = uuidgen()
      const response = await axios.put<PUTRoomEventSendResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/send/com.matpay.create/${event_txn_id}`,
        create_event,
        { validateStatus: () => true }
      )
      if (response.status !== 200) {
        throw new Error((response.data as unknown as MatrixError).error)
      }
      // TODO: approve immediately by the user him/herself
      // TODO: notify other stores
    },
    async action_modify_tx_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
      tx_old: GroupedTransaction,
      tx_new: GroupedTransaction
    }) {
      throw new Error('TO BE IMPLEMENTED')
    },
    async action_approve_tx_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
      approval: PendingApproval
    }) {
      const room_id = payload.room_id
      const approval = payload.approval
      const user_id = rootGetters['auth/user_id'] as string
      if (!state.transactions[room_id].pending_approvals.includes(approval)) {
        throw new Error('This pending approval does not exist or is already approved!')
      }
      if (approval.approvals[user_id]) {
        throw new Error('This pending approval has already been approved!')
      }
      // Construct & send the event
      const approve_event = {
        event_id: approval.event_id
      }
      const homeserver: string = rootGetters['auth/homeserver']
      const event_txn_id = uuidgen()
      const response = await axios.put<PUTRoomEventSendResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/send/com.matpay.approve/${event_txn_id}`,
        approve_event,
        { validateStatus: () => true }
      )
      if (response.status !== 200) {
        throw new Error((response.data as unknown as MatrixError).error)
      }
      // TODO: notify other stores
    },
    async action_reject_tx_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
      approval: PendingApproval
    }) {
      throw new Error('TO BE IMPLEMENTED')
    },
    async action_settle_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
      target_user: User
    }) {
      throw new Error('TO BE IMPLEMENTED')
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
      const room_member_ids: MatrixUserID[] = (rootGetters['rooms/get_users_info_for_room'](room_id) as RoomUserInfo[]).map(u => u.user.user_id)
      for (const rejected_event of rejected_events) {
        const array: Array<[MatrixEventID, MatrixUserID]> = []
        commit('mutation_add_rejected_events_for_room', {
          room_id: room_id,
          rejected_events: array
        })
        commit('mutation_add_processed_event', rejected_event.event_id)
      }
    },
    async action_parse_all_tx_events_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      tx_events: TxMessageEvent[]
    }) {
      for (const tx_event of payload.tx_events) {
        await dispatch('action_parse_single_tx_event_for_room', {
          room_id: payload.room_id,
          tx_event: tx_event
        })
      }
    },
    async action_parse_single_tx_event_for_room ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      tx_event: TxMessageEvent
    }): Promise<boolean> {
      const room_id = payload.room_id
      const tx_event = payload.tx_event
      // check if rejected
      // note: this implementation currently does not check if the user can reject it
      // that is, this allows a user to reject a tx he/she is not participating
      if (Object.keys(state.transactions[room_id].rejected).includes(tx_event.event_id)) {
        return false
      }
      // parse based on event types
      switch (tx_event.type) {
        case 'com.matpay.create': {
          const tx_event_create = tx_event as TxCreateEvent
          // no previous tx with the same group id
          const existing_group_ids: Set<GroupID> = getters.get_existing_group_ids_for_room(room_id)
          if (existing_group_ids.has(tx_event_create.content.group_id)) {
            return false
          }
          // no previous tx with the same tx id
          const existing_tx_ids: Set<TxID> = getters.get_existing_tx_ids_for_room(room_id)
          const intersect = new Set(
            tx_event_create.content.txs.map(i => i.tx_id).filter(x => existing_tx_ids.has(x))
          )
          if (intersect.size > 0) {
            return false
          }
          // all amounts non negative
          if (tx_event_create.content.txs.map(i => i.amount).filter(i => i < 0).length > 0) {
            return false
          }
          // description not blank
          if (!tx_event_create.content.description) {
            return false
          }
          // Check if group ID UUIDs
          if (!uuidValidate(tx_event_create.content.group_id)) {
            return false
          }
          // Check if tx_ids UUIDs
          const check_tx_id = new Set(
            tx_event_create.content.txs.map(i => i.tx_id).filter(i => !uuidValidate(i))
          )
          if (check_tx_id.size > 0) {
            return false
          }
          const room_users: Array<User> = (rootGetters['user/get_users_info_for_room'](room_id) as Array<RoomUserInfo>)
            .map(u => u.user)
          // all participants in room
          const targets = tx_event_create.content.txs.map(t => t.to)
          const participating_users = targets.concat([tx_event_create.content.from])
          for (const u of participating_users) {
            if (!room_users.map(i => i.user_id).includes(u)) {
              return false
            }
          }
          // sender must participate
          if (!participating_users.includes(tx_event_create.sender)) {
            return false
          }
          // duplicate target
          if (new Set(targets).size !== targets.length) {
            return false
          }
          // construct pending approval
          const txs = tx_event_create.content.txs.map<SimpleTransaction>(i => {
            return {
              amount: i.amount,
              tx_id: i.tx_id,
              to: room_users.filter(j => j.user_id === i.to)[0]
            }
          })
          const new_pending_approval: PendingApproval = {
            event_id: tx_event_create.event_id,
            type: 'create',
            group_id: tx_event_create.content.group_id,
            description: tx_event_create.content.description,
            from: room_users.filter(i => i.user_id === tx_event_create.content.from)[0],
            timestamp: new Date(tx_event_create.origin_server_ts),
            txs: txs,
            approvals: tx_event_create.content.txs.reduce((prev: Record<MatrixRoomID, boolean>, cur) => {
              prev[cur.to] = false
              return prev
            }, {} as Record<MatrixUserID, boolean>)
          }
          commit('mutation_add_pending_approval_for_room', {
            room_id: room_id,
            pending_approval: new_pending_approval
          })
          dispatch('chat/action_parse_single_pending_approval_for_room', {
            room_id: room_id,
            pending_approval: new_pending_approval
          }, { root: true })
          // TODO: notify other stores
          return true
          break
        }
        case 'com.matpay.modify': {
          const tx_event_modify = tx_event as TxModifyEvent
          // amount >= 0
          if (tx_event_modify.content.txs.map(i => i.amount).filter(i => i < 0).length > 0) {
            return false
          }
          // description not blank
          if (!tx_event_modify.content.description) {
            return false
          }
          // Check if group ID UUIDs
          if (!uuidValidate(tx_event_modify.content.group_id)) {
            return false
          }
          // Check if tx_ids UUIDs
          const check_tx_id = new Set(
            tx_event_modify.content.txs.map(i => i.tx_id).filter(i => !uuidValidate(i))
          )
          if (check_tx_id.size > 0) {
            return false
          }
          // Semantic part
          // Create tx with the same group id
          const existing_group_ids: Set<GroupID> = getters.get_existing_group_ids_for_room(room_id)
          if (!existing_group_ids.has(tx_event_modify.content.group_id)) {
            return false
          }
          // Each tx_id has same one in the create event
          const existing_tx_ids: Set<TxID> = getters.get_existing_tx_ids_for_room(room_id)
          const compare_tx_ids = new Set(
            tx_event_modify.content.txs.map(i => i.tx_id).filter(x => existing_tx_ids.has(x))
          )
          if (compare_tx_ids.size === tx_event_modify.content.txs.length) {
            return false
          }
          // get old transaction
          const existing_txs: GroupedTransaction[] = getters.get_grouped_transactions_for_room(room_id)
          let old_tx: GroupedTransaction | undefined
          for (const u of existing_txs) {
            if (u.group_id === tx_event_modify.content.group_id) {
              old_tx = u
              break
            }
          }
          // The sender participates in this transaction
          const is_from = old_tx?.from.user_id === tx_event_modify.sender
          let is_to = false
          for (const u of tx_event_modify.content.txs) {
            if (u.to === tx_event_modify.sender) {
              is_to = true
              break
            }
          }
          if (is_to === false && is_from === false) {
            return false
          }
          // At least one description
          // OR at least one simple transaction is modified
          // AND To-sides of the transactions are not modified
          const description_changed = old_tx?.description !== tx_event_modify.content.description
          let simple_tx_changed = false
          for (const u of tx_event_modify.content.txs) {
            if (old_tx?.txs) {
              for (const v of old_tx?.txs) {
                if (u.tx_id === v.tx_id) {
                  if (u.to !== v.to.user_id) {
                    return false
                  }
                  if (u.amount !== v.amount) {
                    simple_tx_changed = true
                    break
                  }
                }
              }
            }
            if (simple_tx_changed === false && description_changed === false) {
              return false
            }
          }
          return true
          break
        }
        case 'com.matpay.approve': {
          const tx_event_approve = tx_event as TxApproveEvent
          const existing_pending_approval: PendingApproval[] = getters.get_pending_approvals_for_room(room_id)
          const compare_event_ids = new Set(
            existing_pending_approval.filter(x => x.event_id === tx_event_approve.event_id)
          )
          // There exists data event before this event that has the same event_id
          if (compare_event_ids.size === 0) {
            return false
          }
          // A user can only approve once
          for (const e of existing_pending_approval) {
            if (e.approvals[tx_event_approve.sender]) {
              return false
            }
          }
          const rejected_events: MatrixEventID[] = Object.keys(state.transactions[room_id].rejected)
          const compare_rejected_ids = new Set(
            rejected_events.filter(x => x === tx_event_approve.event_id)
          )
          // Event ID is not in rejected event list
          if (compare_rejected_ids.size > 0) {
            return false
          }
          const event_id = tx_event_approve.content.event_id
          // Mark as validated
          try {
            commit('mutation_mark_user_as_approved_for_room', {
              room_id: room_id,
              user_id: tx_event_approve.sender,
              event_id: event_id
            })
          } catch (e) {
            return false
          }
          // Check if everyone has approved
          const current_approval = state.transactions[room_id].pending_approvals.filter(i => i.event_id === event_id)[0]
          if (Object.values(current_approval.approvals).every(i => i === true)) {
            // Apply approved changes to basic storage
            if (current_approval.type === 'modify') {
              commit('mutation_modify_grouped_transaction_for_room', {
                room_id: room_id,
                group_id: current_approval.group_id,
                description: current_approval.description,
                txs: current_approval.txs
              })
              commit('mutation_change_tx_state_for_room', {
                room_id: room_id,
                group_id: current_approval.group_id,
                state: 'approved'
              })
            } else {
              const new_tx: GroupedTransaction = {
                from: current_approval.from,
                txs: current_approval.txs,
                timestamp: current_approval.timestamp,
                group_id: current_approval.group_id,
                pending_approvals: [],
                description: current_approval.description,
                state: 'approved'
              }
              commit('mutation_add_approved_grouped_transaction_for_room', {
                room_id: room_id,
                grouped_tx: new_tx
              })
            }
            commit('mutation_remove_pending_approval_for_room', {
              room_id: room_id,
              event_id: current_approval.event_id
            })
            dispatch('chat/action_parse_single_grouped_tx_for_room', {
              room_id: room_id,
              grouped_tx: state.transactions[room_id].basic.filter(i => i.group_id === current_approval.group_id)[0]
            }, { root: true })
          }
          return true
          break
        }
        case 'com.matpay.settle': {
          const tx_event_settle = tx_event as TxSettleEvent
          // User is in the room
          const room_members: RoomUserInfo[] = getters.get_users_info_for_room(room_id)
          if (room_members.filter(id => id.user.user_id === tx_event_settle.content.user_id).length === 0) {
            return false
          }
          const tx_in_graph : Array<string|number> = state.transactions[room_id].graph ? [tx_event_settle.content.user_id] : []
          // Sending user is on receiving side
          if (tx_in_graph.length === 0 || tx_in_graph[0] !== tx_event_settle.sender) {
            return false
          }
          // amount is greater than 0 and smaller or same as the open balance
          if (tx_event_settle.content.amount <= 0 || tx_event_settle.content.amount > tx_in_graph[1]) {
            return false
          }
          // event_id matches a previous event
          const event_ids : Set<TxID> = getters.get_existing_tx_ids_for_room(room_id)
          if (!event_ids.has(tx_event_settle.event_id)) {
            return false
          }
          // TODO: Check for open balance between sender and user with specific user_id after running settlement and optimization algorithm
          return true
          break
        }
        default: {
          throw new Error('Invalid transaction event type!')
        }
      }
    }
  },
  getters: <GetterTree<State, any>>{
    get_grouped_transactions_for_room: (state: State) => (room_id: MatrixRoomID): GroupedTransaction[] => {
      return state.transactions[room_id].basic
    },
    get_pending_approvals_for_room: (state: State) => (room_id: MatrixRoomID): PendingApproval[] => {
      return state.transactions[room_id].pending_approvals
    },
    get_existing_group_ids_for_room: (state: State) => (room_id: MatrixRoomID): Set<GroupID> => {
      const existing_txs: GroupedTransaction[] = state.transactions[room_id].basic
      const existing_pending_approvals: PendingApproval[] = state.transactions[room_id].pending_approvals
      return new Set([
        ...(existing_txs.map(t => t.group_id)),
        ...(existing_pending_approvals.map(t => t.group_id))
      ])
    },
    get_existing_tx_ids_for_room: (state: State) => (room_id: MatrixRoomID): Set<TxID> => {
      const existing_txs: GroupedTransaction[] = state.transactions[room_id].basic
      const existing_pending_approvals: PendingApproval[] = state.transactions[room_id].pending_approvals
      return new Set([
        ...(existing_txs.reduce((a: string[], b) => {
          return a.concat(b.txs.map(t => t.tx_id))
        }, [])),
        ...(existing_pending_approvals.reduce((a: string[], b) => {
          return a.concat(b.txs.map(t => t.tx_id))
        }, []))
      ])
    },
    get_open_balance_against_user_for_room: (state: State, getters, rootState, rootGetters) =>
      (room_id: MatrixRoomID, target_user_id: MatrixUserID): number => {
        // In this getter, negative means receiving.
        const grouped_txs = state.transactions[room_id].basic
        const current_user_id : MatrixUserID = rootGetters['auth/user_id']
        let balance = 0
        for (const grouped_tx of grouped_txs) {
          // Case 1: the current user is on the from side
          if (grouped_tx.from.user_id === current_user_id) {
            // Scan for all simple tx and look for target
            const oweing_sum = grouped_tx.txs
              .filter(i => i.to.user_id === target_user_id)
              .map(i => i.amount)
              .reduce((sum, tx) => sum + tx, 0)
            balance -= oweing_sum
          }
          // Case 2: the target user is on the from side
          if (grouped_tx.from.user_id === target_user_id) {
            const owed_sum = grouped_tx.txs
              .filter(i => i.to.user_id === current_user_id)
              .map(i => i.amount)
              .reduce((sum, tx) => sum + tx, 0)
            balance += owed_sum
          }
        }
        return balance
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
