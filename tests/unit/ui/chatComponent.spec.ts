import { config, mount, shallowMount } from '@vue/test-utils'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { room_01_room_id, user_1, user_2, user_3 } from '../mocks/mocked_user'
import { ChatLog, ChatMessage, TxApprovedPlaceholder } from '@/models/chat.model'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import ChatComponent from '@/components/ChatComponent.vue'

import Login from '@/tabs/Login.vue'
import { test_account2, test_homeserver } from '../../test_utils'
import { createStore } from 'vuex'
import TxDetail from '@/components/TxDetail.vue'
import { newStore } from '@/store'
import ChatMessageBox from '@/components/ChatMessageBox.vue'
import App from '@/App.vue'
import router from '@/router'
import { RoomUserInfo, User } from '@/models/user.model'

describe('Test chatComponent', () => {
  let store = newStore()
  beforeEach(() => {
    store = newStore()
  })
  beforeAll(() => {
    config.global.mocks = {}
  })
  const mocked_user_info1 : RoomUserInfo = {
    user: user_1,
    displayname: 'Allen', // displayname after resolving conflicts. Different from user.displayname.
    user_type: 'Admin',
    is_self: true,
    avatar_url: uuidgen()
  }

  describe('Test component UI', () => {
    it('All the buttons show correctly', function () {
      const room_id = 'aaa'
      const mock_chat_message : ChatMessage = {
        sender: user_1,
        content: 'Hello,Allen',
        timestamp: new Date('2022/1/16')
      }
      const mock_chatlog : ChatLog = { messages: [mock_chat_message] }
      const store = createStore({
        modules: {
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: jest.fn(),
              homeserver: jest.fn()
            }
          },
          chat: {
            namespaced: true,
            getters: {
              get_chat_log_for_room: (room_id) => () => mock_chatlog.messages
            }
          },
          rooms: {
            namespaced: true,
            getters: {

            }
          }
        }
      })
      store.state.auth.user_id = user_1.user_id
      const wrapper = shallowMount(ChatComponent, {
        global: {
          plugins: [router, store]
        },
        props: {
          users_info: [mocked_user_info1]
        }
      }
      )
      expect(wrapper.find('#sendButton').attributes('‘disabled')).toBe(false)
      expect(wrapper.find('#sendButton').exists()).toBe(true)
      expect(wrapper.find('#historyButton').isVisible()).toBe(true)
      expect(wrapper.find('#sendInput').isVisible()).toBe(true)
      expect(wrapper.find('#createButton').isVisible()).toBe(true)
    })
  })
})
