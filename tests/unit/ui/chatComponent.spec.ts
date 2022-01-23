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
import ModificationDialog from '@/dialogs/ModificationDialog.vue'
import bootstrap from 'bootstrap'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>
describe('Test chatComponent', () => {
  let popover_description_called = false
  let popover_amount_called = false
  let store = newStore()
  beforeEach(() => {
    store = newStore()
    mockedBootstrap.Popover.mockImplementationOnce(function (element, options) {
      if (element === '#input-description') {
        popover_description_called = true
      } else if (element === '#input-amount') {
        popover_amount_called = true
      }
      return new bootstrap.Popover(element, options)
    })
    popover_description_called = false
    popover_amount_called = false
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
              get_chat_log_for_room: (room_id) => () => mock_chatlog
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
      expect(wrapper.find('#sendButton').exists()).toBe(true)
      expect(wrapper.find('#historyButton').exists()).toBe(true)
      expect(wrapper.find('#sendInput').exists()).toBe(true)
      expect(wrapper.find('#createButton').exists()).toBe(true)
      expect(wrapper.find('#sendButton').isVisible()).toBe(true)
      expect(wrapper.find('#historyButton').isVisible()).toBe(true)
      expect(wrapper.find('#sendInput').isVisible()).toBe(true)
      expect(wrapper.find('#createButton').isVisible()).toBe(true)
    })
    it('Test if the user can click on send button when he types in nothing', async () => {
      const room_id = 'aaa'
      const $route = {
        fullPath: 'full/path'
      }
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
              homeserver: jest.fn(),
              auth_id: () => 'fdsfsd'
            }
          },
          chat: {
            namespaced: true,
            getters: {
              get_chat_log_for_room: (room_id) => () => mock_chatlog
            }
          },
          rooms: {
            namespaced: true,
            getters: {
            }
          }
        }
      })
      const wrapper = shallowMount(ChatComponent, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store],
          mocks: {
            $route: {
              params: {
                room_id: room_01_room_id
              }
            }
          }
        },
        props: {
          users_info: [mocked_user_info1]
        }
      })
      await wrapper.find('#sendInputText').setValue('')
      expect((wrapper.find('#sendButton').element as HTMLButtonElement).disabled).toBe(true)
    })
  })
  describe('Test CreateTxDialog', () => {
    it('Test empty input(description)', async () => {
      const wrapper = shallowMount(CreateTxDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          users_info: [
            {
              user: user_1,
              displayname: user_1.displayname,
              user_type: 'Member',
              is_self: true,
              avatar_url: ''
            }, {
              user: user_2,
              displayname: user_2.displayname,
              user_type: 'Member',
              is_self: false,
              avatar_url: ''
            }
          ]
        }
      })
      await wrapper.find('#input-description').setValue('')
      await wrapper.find('#create-confirm').trigger('click')
      expect(popover_description_called).toBeTruthy()
    })
    // expect(popover_amount_called).toBeTruthy()
    it('Test empty input(amount)', async () => {
      const wrapper = shallowMount(CreateTxDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          users_info: [
            {
              user: user_1,
              displayname: user_1.displayname,
              user_type: 'Member',
              is_self: true,
              avatar_url: ''
            }, {
              user: user_2,
              displayname: user_2.displayname,
              user_type: 'Member',
              is_self: false,
              avatar_url: ''
            }
          ]
        }
      })
      await wrapper.find('#input-description').setValue('okok')
      await wrapper.find('#input-amount').setValue('')
      await wrapper.find('#create-confirm').trigger('click')
      expect(popover_amount_called).toBeTruthy()
    })
    it('Test negativ input', async () => {
      const wrapper = shallowMount(CreateTxDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          users_info: [
            {
              user: user_1,
              displayname: user_1.displayname,
              user_type: 'Member',
              is_self: true,
              avatar_url: ''
            }, {
              user: user_2,
              displayname: user_2.displayname,
              user_type: 'Member',
              is_self: false,
              avatar_url: ''
            }
          ]
        }
      })
      await wrapper.find('#input-description').setValue('okok')
      await wrapper.find('#input-amount').setValue('-1')
      await wrapper.find('#create-confirm').trigger('click')
      expect(popover_amount_called).toBeTruthy()
    })
  })
})
