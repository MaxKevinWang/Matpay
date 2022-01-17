import { config, mount } from '@vue/test-utils'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import ChatComponent from '@/components/ChatComponent.vue'
import { shallowMount } from '@vue/test-utils'
import Login from '@/tabs/Login.vue'
import { test_account2, test_homeserver } from '../../test_utils'
import { createStore } from 'vuex'
import TxDetail from '@/components/TxDetail.vue'
import { newStore } from '@/store'
import ChatMessageBox from '@/components/ChatMessageBox.vue'
import App from '@/App.vue'
import router from '@/router'

describe('Test chatComponent', () => {
  let store = newStore()
  beforeEach(() => {
    store = newStore()
  })
  beforeAll(() => {
    config.global.mocks = {}
  })

  describe('Test component UI', () => {
    it('All the buttons show correctly', function () {
      const store = createStore({
        modules: {
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: jest.fn(),
              homeserver: jest.fn()
            }
          }
        }
      })
      const wrapper = shallowMount(App, {
        global: {
          plugins: [router, store]
        }
      })
      expect(wrapper.find('#logout_button').isVisible()).toEqual(true)
      expect(wrapper.find('#logout_button').isVisible()).toEqual(true)
      expect(wrapper.find('#logout_button').isVisible()).toEqual(true)
    })
  })
})
