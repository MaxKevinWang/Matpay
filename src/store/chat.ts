import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage, TxApprovedPlaceholder, TxPendingPlaceholder } from '@/models/chat.model'
import { RoomUserInfo, User } from '@/models/user.model'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'
interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
  processed_events: Set<MatrixEventID>
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {},
      processed_events: new Set()
    }
  },
  mutations: <MutationTree<State>>{
    mutation_add_processed_event (state: State, payload: MatrixEventID) {
      state.processed_events.add(payload)
    },
    mutation_init_chat_log_for_room (state: State, payload: MatrixRoomID) {
      state.chat_log[payload] = {
        messages: []
      }
    },
    mutation_add_chat_log_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      chat_log: ChatLog
    }) {
      state.chat_log[payload.room_id].messages = state.chat_log[payload.room_id].messages.concat(payload.chat_log.messages)
    }
  },
  actions: <ActionTree<State, any>>{
    async action_create_mock_chat ({
      state,
      commit,
      getters,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID
    }) {
      if (payload.room_id === '!EvvZcelEXcSOJBxJov:dsn.tm.kit.edu') {
        commit('mutation_init_chat_log_for_room', payload.room_id)
        const users : Array<RoomUserInfo> = rootGetters['user/get_users_info_for_room']([payload.room_id])
        const user_1 = users.filter(u => u.user.user_id === '@test-1:dsn.tm.kit.edu')[0].user
        const user_2 = users.filter(u => u.user.user_id === '@test-2:dsn.tm.kit.edu')[0].user
        const user_3 = users.filter(u => u.user.user_id === '@test-3:dsn.tm.kit.edu')[0].user
        const msg1 : ChatMessage = {
          sender: user_1,
          content: 'User 1 saaaaa',
          timestamp: new Date(2022, 0, 1, 17, 30)
        }
        const msg2 : ChatMessage = {
          sender: user_2,
          content: 'User 2 saaaaa',
          timestamp: new Date(2022, 0, 1, 18, 30)
        }
        const msg3 : ChatMessage = {
          sender: user_3,
          content: 'User 3 saaaaa',
          timestamp: new Date(2022, 0, 1, 20, 30)
        }
        const tx : Array<GroupedTransaction> = rootGetters['tx/get_grouped_transactions_for_room'](payload.room_id)
        const pd : Array<PendingApproval> = rootGetters['tx/get_grouped_transactions_for_room'](payload.room_id)
        const msg4 : TxApprovedPlaceholder = {
          type: 'approved',
          timestamp: tx[0].timestamp,
          grouped_tx: tx[0]
        }
        const msg5 : TxApprovedPlaceholder = {
          type: 'approved',
          timestamp: tx[1].timestamp,
          grouped_tx: tx[1]
        }
        const msg6 : TxApprovedPlaceholder = {
          type: 'approved',
          timestamp: tx[2].timestamp,
          grouped_tx: tx[2]
        }
        const msg7: TxPendingPlaceholder = {
          type: 'pending',
          timestamp: pd[0].timestamp,
          approval: pd[0]
        }
        const msg8: TxPendingPlaceholder = {
          type: 'pending',
          timestamp: pd[1].timestamp,
          approval: pd[1]
        }
        const chat_log = { messages: [msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8] }
        commit('mutation_add_chat_log_for_room', {
          room_id: payload.room_id,
          chat_log: chat_log
        })
      }
    }
  },
  getters: <GetterTree<State, any>>{
    get_chat_log_for_room: (state: State) => (room_id: MatrixRoomID): ChatLog => {
      return state.chat_log[room_id] || { messages: [] }
    }
  }
}

// Testing
export default {
  state: chat_store.state,
  mutations: chat_store.mutations,
  actions: chat_store.actions,
  getters: chat_store.getters
}
