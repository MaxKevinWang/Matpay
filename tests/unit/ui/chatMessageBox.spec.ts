import { config, shallowMount } from '@vue/test-utils'
import { user_1, user_2 } from '../mocks/mocked_user'
import { ChatMessage } from '@/models/chat.model'
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
