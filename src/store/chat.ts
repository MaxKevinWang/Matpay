import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupID, MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage, TxApprovedPlaceholder, TxPendingPlaceholder, TxPlaceholder } from '@/models/chat.model'
import { RoomUserInfo } from '@/models/user.model'
import { MatrixRoomChatMessageEvent } from '@/interface/rooms_event.interface'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'
import { PUTRoomEventSendResponse } from '@/interface/api.interface'
import { uuidgen } from '@/utils/utils'
import { MatrixError } from '@/interface/error.interface'
import { TxRejectedEvent } from '@/interface/tx_event.interface'

interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
  rejected_events: Record<MatrixRoomID, Set<MatrixEventID>>
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {},
      rejected_events: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
      state.chat_log[payload] = {
        messages: []
      }
      state.rejected_events[payload] = new Set()
    },
    mutation_remove_joined_room (state: State, payload: MatrixRoomID) {
      delete state.chat_log[payload]
      delete state.rejected_events[payload]
    },
    mutation_set_rejected_events_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      rejected_events: Array<MatrixEventID>
    }) {
      state.rejected_events[payload.room_id] = new Set(payload.rejected_events)
    },
    mutation_add_single_message_for_room (state: State, payload: {
      room_id: MatrixRoomID,
      msg: ChatMessage | TxPlaceholder
    }) {
      const messages = state.chat_log[payload.room_id].messages
      // Transaction messages should overwrite previous ones with the same group ID
      if ('type' in payload.msg) {
        let group_id : GroupID
        if ('grouped_tx' in payload.msg) {
          // approved tx
          group_id = payload.msg.grouped_tx.group_id
          const prev_tx_msg = messages.filter(i => 'grouped_tx' in i && i.grouped_tx.group_id === group_id)
          const prev_approval_msg = messages.filter(i => 'approval' in i && i.approval.group_id === group_id)
          for (const prev_msg of prev_tx_msg.concat(prev_approval_msg)) {
            const index = messages.indexOf(prev_msg)
            messages.splice(index, 1)
          }
        } else {
          // pending approval
          group_id = payload.msg.approval.group_id
        }
      }
      state.chat_log[payload.room_id].messages.push(payload.msg)
      // Sort
      state.chat_log[payload.room_id].messages.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      )
    },
    mutation_reset_state (state: State) {
      Object.assign(state, {
        chat_log: {},
        rejected_events: {}
      })
    }
  },
  actions: <ActionTree<State, any>>{
    action_parse_rejected_event_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      rejected_event: TxRejectedEvent
    }) {
      const room_id = payload.room_id
      const rejected_event = payload.rejected_event
      console.log('Reject data received, ', rejected_event)
      commit('mutation_set_rejected_events_for_room', {
        room_id: room_id,
        rejected_events: rejected_event.content.events
      })
    },
    action_parse_single_chat_message_event_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      message_event: MatrixRoomChatMessageEvent
    }) {
      const room_id = payload.room_id
      const users_info : Array<RoomUserInfo> = rootGetters['user/get_all_users_info_for_room'](room_id)
      const sender = users_info.filter(u => u.user.user_id === payload.message_event.sender)[0]
      const msg : ChatMessage = {
        sender: sender.user,
        timestamp: new Date(payload.message_event.origin_server_ts),
        content: payload.message_event.content.body
      }
      commit('mutation_add_single_message_for_room', {
        room_id: room_id,
        msg: msg
      })
    },
    action_parse_single_pending_approval_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      pending_approval: PendingApproval
    }) {
      const room_id = payload.room_id
      const pending_approval = payload.pending_approval
      if (state.rejected_events[room_id].has(pending_approval.event_id)) {
        return // do not show pending approval if already rejected
      }
      const approval_msg : TxPendingPlaceholder = {
        type: 'pending',
        timestamp: pending_approval.timestamp,
        approval: pending_approval
      }
      commit('mutation_add_single_message_for_room', {
        room_id: room_id,
        msg: approval_msg
      })
    },
    action_parse_single_grouped_tx_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      grouped_tx: GroupedTransaction
    }) {
      const room_id = payload.room_id
      const grouped_tx = payload.grouped_tx
      const tx_message : TxApprovedPlaceholder = {
        type: 'approved',
        timestamp: grouped_tx.timestamp,
        grouped_tx: grouped_tx
      }
      commit('mutation_add_single_message_for_room', {
        room_id: room_id,
        msg: tx_message
      })
    },
    async action_send_chat_message_for_room ({
      state,
      commit,
      dispatch,
      rootGetters
    }, payload: {
      room_id: MatrixRoomID,
      message: string
    }) {
      const room_id = payload.room_id
      const message = payload.message
      if (message.length === 0) {
        throw new Error('The chat message cannot be empty!')
      }
      const homeserver = rootGetters['auth/homeserver']
      const response = await axios.put<PUTRoomEventSendResponse>(`${homeserver}/_matrix/client/r0/rooms/${room_id}/send/m.room.message/${uuidgen()}`, {
        msgtype: 'm.text',
        body: message
      },
      { validateStatus: () => true }
      )
      if (response.status !== 200) {
        throw new Error((response.data as unknown as MatrixError).error)
      }
    }
  },
  getters: <GetterTree<State, any>>{
    get_chat_log_for_room: (state: State) => (room_id: MatrixRoomID): ChatLog => {
      if (!state.chat_log[room_id]) {
        return {
          messages: []
        }
      }
      const messages = state.chat_log[room_id].messages.filter(m => {
        if ('type' in m) {
          if (!('grouped_tx' in m)) {
            return !state.rejected_events[room_id].has(m.approval.event_id)
          } else {
            return true
          }
        } else {
          return true
        }
      })
      return {
        messages: messages
      }
    },
    get_rejected_events_for_room: (state: State) => (room_id: MatrixRoomID): Set<MatrixEventID> => {
      return state.rejected_events[room_id]
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
