import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { GroupID, MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage, TxApprovedPlaceholder, TxPendingPlaceholder, TxPlaceholder } from '@/models/chat.model'
import { KICKED_USER, RoomUserInfo, User } from '@/models/user.model'
import { MatrixRoomChatMessageEvent } from '@/interface/rooms_event.interface'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'
import { PUTRoomEventSendResponse } from '@/interface/api.interface'
import { uuidgen } from '@/utils/utils'
import { MatrixError } from '@/interface/error.interface'
interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {}
    }
  },
  mutations: <MutationTree<State>>{
    mutation_init_joined_room (state: State, payload: MatrixRoomID) {
      state.chat_log[payload] = {
        messages: []
      }
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
          group_id = payload.msg.grouped_tx.group_id
        } else {
          group_id = payload.msg.approval.group_id
        }
        const prev_tx_msg = messages.filter(i => 'grouped_tx' in i && i.grouped_tx.group_id === group_id)
        const prev_approval_msg = messages.filter(i => 'approval' in i && i.approval.group_id === group_id)
        for (const prev_msg of prev_tx_msg.concat(prev_approval_msg)) {
          const index = messages.indexOf(prev_msg)
          messages.splice(index, 1)
        }
      }
      // Insertion sort in reverse timestamp order, latest first
      let index = 0
      for (let i = 0; i < messages.length; i++) {
        if (messages[i].timestamp.getTime() >= payload.msg.timestamp.getTime()) {
          index = i
        }
      }
      state.chat_log[payload.room_id].messages.splice(index, 0, payload.msg)
    }
  },
  actions: <ActionTree<State, any>>{
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
      const users_info : Array<RoomUserInfo> = rootGetters['user/get_users_info_for_room'](room_id)
      const sender = users_info.filter(u => u.user.user_id === payload.message_event.sender)[0]
      const msg : ChatMessage = {
        sender: sender ? sender.user : KICKED_USER,
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
      if (!message || message.length === 0) {
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
      // TODO: notify other stores
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
