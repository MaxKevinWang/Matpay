import { newStore } from '@/store'
import { config, shallowMount } from '@vue/test-utils'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import { user_1, user_2 } from '../mocks/mocked_user'
import MemberList from '@/components/MemberList.vue'
import { createStore } from 'vuex'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'
import bootstrap from 'bootstrap'
import UserInviteDialog from '@/dialogs/UserInviteDialog.vue'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>
describe('Test MemberList Component', () => {
  let popover_description_called = false
  let store = newStore()
  beforeEach(() => {
    store = newStore()
    mockedBootstrap.Popover.mockImplementationOnce(function (element, options) {
      if (element === '#invite-userid') {
        popover_description_called = true
      }
      return new bootstrap.Popover(element, options)
    })
    popover_description_called = false
  })
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      split_percentage: split_percentage,
      to_currency_display: to_currency_display
    }
  })
  describe('Test component UI', () => {
    it('Test if the component shows information correctly', () => {
      const wrapper = shallowMount(MemberList, {
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
            }]
        }
      })
      const list1 = wrapper.findAll('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      expect(list1[0].find(`#name-card${user_1.displayname}`).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
  })
  describe('Test UserInviteDialog', () => {
    it('Test empty input(without userid)', async () => {
      const wrapper = shallowMount(UserInviteDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id'
        }
      })
      await wrapper.find('#invite-userid').setValue('')
      await wrapper.find('#invite-confirm').trigger('click')
      expect(popover_description_called).toBeTruthy()
    })
    it('Test inviting the user himself', async () => {
      const store = createStore({
        modules: {
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn()
            }
          }
        }
      })
      const wrapper = shallowMount(UserInviteDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id'
        }
      })
      await wrapper.find('#invite-userid').setValue('@test-1:dsn.tm.kit.edu')
      await wrapper.find('#invite-confirm').trigger('click')
      expect(popover_description_called).toBeTruthy()
    })
  })
})
