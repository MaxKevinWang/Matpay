import { createStore } from 'vuex'
import { ChatLog } from '@/models/chat.model'
import { MatrixRoomID } from '@/models/id.model'
import { User } from '@/models/user.model'

function mockChatStore (chat_log: ChatLog) {
  return createStore({
    modules: {
      auth: {
        namespaced: true,
        getters: {
          device_id: jest.fn(),
          is_logged_in: jest.fn(),
          user_id: () => 'A',
          homeserver: jest.fn()
        }
      },
      chat: {
        namespaced: true,
        getters: {
          get_chat_log_for_room: (state: unknown) => (room_id: MatrixRoomID) => {
            return chat_log
          }
        }
      }
    }
  })
}
describe('Test Vue Component ChatComponent', () => {
  const user_A : User = {
    user_id: 'AAAA',
    displayname: 'User A'
  }
  const user_B : User = {
    user_id: 'BBBB',
    displayname: 'User B'
  }
  describe('Test 2 chat messages', () => {
    const store = mockChatStore({
      messages: [
        {
          sender: user_A,
          timestamp: new Date(),
          content: 'This is a message!'
        },
        {
          sender: user_B,
          timestamp: new Date(),
          content: 'This is also a message!'
        }
      ]
    })
  })
})
