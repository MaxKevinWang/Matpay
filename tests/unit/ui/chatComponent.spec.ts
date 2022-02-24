import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import { room_01_room_id, user_1, user_2 } from '../mocks/mocked_user'
import { ChatLog, ChatMessage, TxApprovedPlaceholder, TxPendingPlaceholder } from '@/models/chat.model'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import ChatComponent from '@/components/ChatComponent.vue'
import { createStore } from 'vuex'
import { newStore } from '@/store'
import router from '@/router'
import { RoomUserInfo, User } from '@/models/user.model'
import bootstrap from 'bootstrap'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'

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
    config.global.mocks = {
      sum_amount: sum_amount,
      split_percentage: split_percentage,
      to_currency_display: to_currency_display,
      selectorify: selectorify
    }
  })
  const mocked_user_info1 : RoomUserInfo = {
    user: user_1,
    displayname: 'Allen', // displayname after resolving conflicts. Different from user.displayname.
    user_type: 'Admin',
    is_self: true,
    avatar_url: uuidgen()
  }

  describe('Test component UI', () => {
    it('Test show up of createTxdialog', async () => {
      const mock_chat_message : ChatMessage = {
        sender: user_1,
        content: 'Hello,Allen',
        timestamp: new Date('2022/1/16')
      }
      const mock_chatlog : ChatLog = { messages: [mock_chat_message] }
      const store = createStore({
        modules: {
          rooms: {
            namespaced: true,
            getters: {
              get_room_name: (room_id) => () => 'fake_room_name'
            }
          },
          chat: {
            namespaced: true,
            getters: {
              get_chat_log_for_room: (room_id) => () => mock_chatlog
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id
            }
          }
        }
      })
      const wrapper = mount(ChatComponent, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store],
          stubs: {
            ConfirmDialog: true,
            SplitCreateDialog: true
          },
          mocks: {
            $route: {
              params: {
                room_id: room_01_room_id
              }
            }
          }
        },
        props: {
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
      await wrapper.find('#createButton').trigger('click')
      await flushPromises()
      await expect(wrapper.vm.$refs.create_tx_dialog.is_shown).toBe(true)
    })
    it('Test show up of SplitTxdialog', async () => {
      const mock_chat_message : ChatMessage = {
        sender: user_1,
        content: 'Hello,Allen',
        timestamp: new Date('2022/1/16')
      }
      const mock_chatlog : ChatLog = { messages: [mock_chat_message] }
      const store = createStore({
        modules: {
          rooms: {
            namespaced: true,
            getters: {
              get_room_name: (room_id) => () => 'fake_room_name'
            }
          },
          chat: {
            namespaced: true,
            getters: {
              get_chat_log_for_room: (room_id) => () => mock_chatlog
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id
            }
          }
        }
      })
      const wrapper = mount(CreateTxDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store],
          stubs: {
            ConfirmDialog: true
          },
          mocks: {
            $route: {
              params: {
                room_id: room_01_room_id
              }
            }
          }
        },
        props: {
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
      await wrapper.find('#split_button').trigger('click')
      await flushPromises()
      await expect(wrapper.vm.$refs.split_dialog.is_shown).toBe(true)
    })
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
    // fuck
    it('Test if the chat_dialog show correctly', async () => {
      const $route = {
        fullPath: 'full/path'
      }
      const mock_chat_message : ChatMessage = {
        sender: user_1,
        content: 'Hello,Peter',
        timestamp: new Date('2022/1/16')
      }
      const mock_chat_message2: ChatMessage = {
        sender: user_2,
        content: 'Hello,Allen',
        timestamp: new Date('2022/1/17')
      }
      const mock_chatlog : ChatLog = { messages: [mock_chat_message, mock_chat_message2] }
      const store = createStore({
        modules: {
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn(),
              auth_id: () => 'fdsfsd'
            }
          },
          chat: {
            namespaced: true,
            getters: {
              get_chat_log_for_room: (room_01_room_id) => () => mock_chatlog
            }
          },
          rooms: {
            namespaced: true,
            getters: {
            }
          }
        }
      })
      const wrapper = mount(ChatComponent, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          stubs: {
            CreateTxDialog: true
          },
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
          users_info: [mocked_user_info1],
          room_id: room_01_room_id,
          chat_message: mock_chat_message
        }
      })
      expect(wrapper.findAllComponents({ name: 'ChatMessageBox' })[1].element.innerHTML.includes('Hello,Peter')).toBe(true)
      expect(wrapper.findAllComponents({ name: 'ChatMessageBox' })[0].element.innerHTML.includes('Hello,Allen')).toBe(true)
    })
    it('Test if the transactions show correctly', async () => {
      const room_id = 'aaa'
      const $route = {
        fullPath: 'full/path'
      }
      const fake_group_id1 = uuidgen()
      const mock_grouped_tx : GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id1,
        state: 'approved',
        txs: [],
        description: 'Hello transaction',
        participants: [],
        timestamp: new Date('1/15/2022'),
        pending_approvals: []
      }
      const mock_approved_message: TxApprovedPlaceholder = {
        type: 'approved',
        timestamp: new Date('1/15/2022'),
        grouped_tx: mock_grouped_tx
      }
      const mock_chatlog : ChatLog = { messages: [mock_approved_message] }
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
      const wrapper = mount(ChatComponent, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          stubs: {
            CreateTxDialog: true
          },
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
          users_info: [mocked_user_info1],
          reference: mock_approved_message,
          room_id: room_01_room_id
        }
      })
      expect(wrapper.findAllComponents({ name: 'TxApprovedMessageBox' })[0].element.innerHTML.includes('Hello transaction')).toBe(true)
      expect(wrapper.findAllComponents({ name: 'TxApprovedMessageBox' })[0].element.innerHTML.includes(new Date(2022, 0, 15).toLocaleDateString())).toBe(true)
      expect(wrapper.findAllComponents({ name: 'TxApprovedMessageBox' })[0].element.innerHTML.includes(user_1.displayname)).toBe(true)
    })
    it('Test animation', async () => {
      const room_id = 'aaa'
      const $route = {
        fullPath: 'full/path'
      }
      const fake_group_id1 = uuidgen()
      const mock_grouped_tx : GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id1,
        state: 'approved',
        txs: [],
        description: 'Hello transaction',
        participants: [],
        timestamp: new Date('1/15/2022'),
        pending_approvals: []
      }
      const mock_approved_message: TxApprovedPlaceholder = {
        type: 'approved',
        timestamp: new Date('1/15/2022'),
        grouped_tx: mock_grouped_tx
      }

      const mock_modify_message: PendingApproval = {
        event_id: uuidgen(),
        type: 'modify',
        group_id: fake_group_id1,
        approvals: {},
        from: user_1,
        description: 'Hello',
        timestamp: new Date('1/15/2022'),
        txs: []
      }

      const mock_modification: TxPendingPlaceholder = {
        type: 'pending',
        timestamp: new Date('1/15/2022'),
        approval: mock_modify_message
      }

      const mock_chatlog : ChatLog = { messages: [mock_approved_message, mock_modification] }
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
      jest.useFakeTimers()
      const wrapper = mount(ChatComponent, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          stubs: {
            CreateTxDialog: true
          },
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
          users_info: [mocked_user_info1],
          reference: { mock_approved_message, mock_modification },
          room_id: room_01_room_id
        }
      })
      expect(wrapper.findAllComponents({ name: 'TxApprovedMessageBox' })[0].element.innerHTML.includes('Hello transaction')).toBe(true)
      const button = wrapper.findAll('.btn-info').filter(w => w.attributes('data-test') === 'previous')
      button[0].trigger('click')
      jest.advanceTimersByTime(1000)
      const animation = wrapper.findAll('.animation-emphasize')
      expect(animation).toHaveLength(1)
    })
    it('Test if the user can send messages when he types in correct messages', async () => {
      const room_id = 'aaa'
      let if_send = false
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
            },
            actions: {
              action_send_chat_message_for_room: (room_id) => {
                if_send = true
              }
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
      await wrapper.find('#sendInputText').setValue('hello,allen')
      expect((wrapper.find('#sendButton').element as HTMLButtonElement).disabled).toBe(false)
      await wrapper.find('#sendButton').trigger('click')
      expect(if_send).toEqual(true)
    })
    it('Test (assume the sending always fails)', async () => {
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
            },
            actions: {
              action_send_chat_message_for_room: () => { throw new Error('Error, sending is failed') }
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
      await wrapper.find('#sendInputText').setValue('hello,allen')
      expect((wrapper.find('#sendButton').element as HTMLButtonElement).disabled).toBe(false)
      await wrapper.find('#sendButton').trigger('click')
      expect(wrapper.emitted()).toHaveProperty('on-error')
      expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Error, sending is failed'))
    })
    it('Test create TX dialog shows up', async () => {
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
            },
            actions: {
              action_send_chat_message_for_room: () => { throw new Error('Error, sending is failed') }
            }
          },
          rooms: {
            namespaced: true,
            getters: {
            }
          }
        }
      })
      const wrapper = mount(ChatComponent, {
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
          users_info: [mocked_user_info1],
          room_id: 'aaa'
        }
      })
      await wrapper.find('#sendInputText').setValue('hello,allen')
      expect((wrapper.find('#sendButton').element as HTMLButtonElement).disabled).toBe(false)
      await wrapper.find('#sendButton').trigger('click')
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
