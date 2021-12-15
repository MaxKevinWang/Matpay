import axios from 'axios'
import { ActionTree, GetterTree, MutationTree } from 'vuex'
import { MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage } from '@/models/chat.model'
import { User } from '@/models/user.model'
import { tx1, tx2, tx3, pd1, pd2 } from '@/store/tx'

// mocked chat messages
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
const chat1 : ChatMessage = {
  sender: user_A,
  timestamp: new Date(2021, 12, 1, 19, 45, 0),
  content: 'Hello!!!!! from A'
}
const chat2 : ChatMessage = {
  sender: user_C,
  timestamp: new Date(2021, 12, 1, 20, 45, 0),
  content: 'Hello!!!!! from C'
}
const chat3 : ChatMessage = {
  sender: user_B,
  timestamp: new Date(2021, 12, 1, 17, 35, 0),
  content: 'Hello!!!!! from B'
}
interface State {
  chat_log: Record<MatrixRoomID, ChatLog>
}

export const chat_store = {
  namespaced: true,
  state (): State {
    return {
      chat_log: {}
    }
  },
  mutations: <MutationTree<State>>{
  },
  actions: <ActionTree<State, any>>{
  },
  getters: <GetterTree<State, any>>{
    get_chat_log_for_room: (state: State) => (room_id: MatrixRoomID): ChatLog => {
      if (room_id === '!YVcDePcjikPMmUjRtZ:dsn.tm.kit.edu') {
        return {
          messages: [
            chat1,
            chat2,
            chat3,
            {
              type: 'approved',
              timestamp: tx1.timestamp,
              grouped_tx: tx1
            },
            {
              type: 'approved',
              timestamp: tx2.timestamp,
              grouped_tx: tx2
            },
            {
              type: 'approved',
              timestamp: tx3.timestamp,
              grouped_tx: tx3
            },
            {
              type: 'pending',
              timestamp: pd1.timestamp,
              approval: pd1
            },
            {
              type: 'pending',
              timestamp: pd2.timestamp,
              approval: pd2
            }
          ]
        }
      } else {
        return {
          messages: []
        }
      }
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
