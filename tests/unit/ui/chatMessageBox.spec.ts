import { config, mount, shallowMount } from '@vue/test-utils'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { ChatMessage, TxApprovedPlaceholder } from '@/models/chat.model'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import ChatComponent from '@/components/ChatComponent.vue'
import Login from '@/tabs/Login.vue'
import { test_account2, test_homeserver } from '../../test_utils'
import { createStore } from 'vuex'
import TxDetail from '@/components/TxDetail.vue'
import { newStore } from '@/store'
import ChatMessageBox from '@/components/ChatMessageBox.vue'
describe('Test chatComponent', () => {
  let store = newStore()
  beforeEach(() => {
    store = newStore()
  })
  beforeAll(() => {
    config.global.mocks = {
    }
  })

  describe('Test component UI', () => {
    it('Test the correct display(User not the sender)', async () => {
      const chat_message : ChatMessage = {
        timestamp: new Date('2022/1/16'),
        content: 'HelloWord',
        sender: user_2
      }
      store.state.auth.user_id = user_1.user_id
      const wrapper = shallowMount(ChatMessageBox, {
        global: {
          plugins: [store]
        },
        props: {
          chat_message: chat_message,
          room_id: 'aaa'
        }
      })
      expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('HelloWord')).length).toBe(1)
      expect(wrapper.findAll('div').map(i => i.element.style.borderRadius)).toSatisfyAll(i => i === '15px' || i === '')
      expect(wrapper.findAll('div').map(i => i.element.style.backgroundColor)).toSatisfyAll(i => i === 'rgba(57, 192, 237, 0.2)' || i === '')
    })
    it('Test the correct display(User is the sender)', async () => {
      const chat_message : ChatMessage = {
        timestamp: new Date('2022/1/16'),
        content: 'HelloWord',
        sender: user_1
      }
      store.state.auth.user_id = user_1.user_id
      const wrapper = shallowMount(ChatMessageBox, {
        global: {
          plugins: [store]
        },
        props: {
          chat_message: chat_message,
          room_id: 'aaa'
        }
      })
      expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('HelloWord')).length).toBe(1)
      expect(wrapper.findAll('div').map(i => i.element.style.borderRadius)).toSatisfyAll(i => i === '15px' || i === '')
      expect(wrapper.findAll('div').map(i => i.element.style.backgroundColor)).toSatisfyAll(i => i === 'rgb(251, 251, 251)' || i === '')
    })
  })
})
