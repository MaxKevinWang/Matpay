import { newStore } from '@/store'
import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import { user_1, user_2 } from '../mocks/mocked_user'
import MemberList from '@/components/MemberList.vue'
import { createStore } from 'vuex'
import bootstrap from 'bootstrap'
import UserInviteDialog from '@/dialogs/UserInviteDialog.vue'
import UserCard from '@/components/UserCard.vue'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>
describe('Test UserCard Component', () => {
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
      to_currency_display: to_currency_display,
      selectorify: selectorify
    }
  })
  describe('Test component UI', () => {
    it('Test another + self is member', async () => {
      const wrapper = shallowMount(UserCard, {
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          can_i_kick_user: false,
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await flushPromises()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Yourself')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Settle')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Leave Room')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Member')).toBeTruthy()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
    it('Test self + self is admin', async () => {
      const wrapper = shallowMount(UserCard, {
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          can_i_kick_user: true,
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Admin',
            is_self: true,
            avatar_url: ''
          }
        }
      })
      await flushPromises()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Yourself')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Settle')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Leave Room')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Admin')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Kick')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Ban')).toBeFalse()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
    it('Test self + self is a member', async () => {
      const wrapper = shallowMount(UserCard, {
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          can_i_kick_user: false,
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: true,
            avatar_url: ''
          }
        }
      })
      await flushPromises()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Yourself')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Settle')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Leave Room')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Member')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Kick')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Ban')).toBeFalse()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
    it('Test another + self is admin', async () => {
      const wrapper = shallowMount(UserCard, {
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          can_i_kick_user: true,
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await flushPromises()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Yourself')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Settle')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Leave Room')).toBeFalse()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Member')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Kick')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Ban')).toBeTruthy()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
    it('Test kick a member', async () => {
      const wrapper = shallowMount(UserCard, {
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          can_i_kick_user: true,
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await flushPromises()
      wrapper.find('#kickButton').trigger('click')
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeFalse()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
  })
})
