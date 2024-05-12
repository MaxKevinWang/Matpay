import { newStore } from '@/store'
import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import { selectorify, split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { user_1, user_2 } from '../mocks/mocked_user'
import bootstrap from 'bootstrap'
import UserCard from '@/components/UserCard.vue'
import { MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { createStore } from 'vuex'
import { User } from '@/models/user.model'

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
      const store = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => 10
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
      const store = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => 10
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
      const store = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => 10
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
      const store = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => 10
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
    it('Test if the balance shows correctly', async () => {
      const store = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => 10
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
      // wrapper.find('#kickButton').trigger('click')
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('10')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('You oweing:')).toBeTruthy()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
  })
  describe('Test settlement dialog', () => {
    let store = newStore()
    beforeEach(() => {
      store = newStore()
    })
    beforeAll(() => {
      config.global.mocks = {
        sum_amount: sum_amount,
        split_percentage: split_percentage,
        to_currency_display: to_currency_display,
        selectorify: selectorify
      }
    })
    it('Test show', async () => {
      const store1 = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => -10
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_2.user_id
            }
          }
        }
      })
      const wrapper = mount(UserCard, {
        attachTo: 'body',
        global: {
          plugins: [store1]
        },
        props: {
          room_id: 'fake_room_id',
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await wrapper.find('#card-settle-button').trigger('click')
      await flushPromises()
      await expect(wrapper.vm.$refs.settle_dialog.is_shown).toBe(true)
    })
    it('Test on-settle', async () => {
      let action_called = false
      const store1 = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => -10,
            },
            actions: {
              action_settle_for_room: (context, payload: {room_id: MatrixRoomID, target_user: User}) => { action_called = true }
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_2.user_id
            }
          }
        }
      })
      const wrapper = mount(UserCard, {
        attachTo: 'body',
        global: {
          plugins: [store1]
        },
        props: {
          room_id: 'fake_room_id',
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await wrapper.find('#card-settle-button').trigger('click')
      await flushPromises()
      await wrapper.find('#settle-button').trigger('click')
      await flushPromises()
      await expect(action_called).toBe(true)
    })
    it('Test on-settle on-error', async () => {
      const store1 = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => -10,
            },
            actions: {
              action_settle_for_room: (context, payload: {room_id: MatrixRoomID, target_user: User}) => { throw new Error('Error')}
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_2.user_id
            }
          }
        }
      })
      const wrapper = mount(UserCard, {
        attachTo: 'body',
        global: {
          plugins: [store1]
        },
        props: {
          room_id: 'fake_room_id',
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await wrapper.find('#card-settle-button').trigger('click')
      await flushPromises()
      await wrapper.find('#settle-button').trigger('click')
      await flushPromises()
      expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Error'))
    })
    it('Test balance Display', async () => {
      let action_called = false
      const store1 = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => -10,
            },
            actions: {
              action_settle_for_room: (context, payload: {room_id: MatrixRoomID, target_user: User}) => { action_called = true }
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_2.user_id
            }
          }
        }
      })
      const wrapper = mount(UserCard, {
        attachTo: 'body',
        global: {
          plugins: [store1]
        },
        props: {
          room_id: 'fake_room_id',
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Member',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await expect(wrapper.find('#balance_display_usercard').element.innerHTML.includes('Oweing you: 0.10€')).toBe(true)
    })
    it('Test balance Display for left user', async () => {
      let action_called = false
      const store1 = createStore({
        modules: {
          tx: {
            namespaced: true,
            getters: {
              get_grouped_transactions_for_room: () => (room_id: MatrixRoomID) => [],
              get_total_open_balance_for_user_for_room: () => (room_id: MatrixRoomID, source_user_id: MatrixUserID) => -10,
              get_open_balance_against_user_for_room: () => () => -10,
            },
            actions: {
              action_settle_for_room: (context, payload: {room_id: MatrixRoomID, target_user: User}) => { action_called = true }
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_2.user_id
            }
          }
        }
      })
      const wrapper = mount(UserCard, {
        attachTo: 'body',
        global: {
          plugins: [store1]
        },
        props: {
          room_id: 'fake_room_id',
          user_prop: {
            user: user_1,
            displayname: user_1.displayname,
            user_type: 'Left',
            is_self: false,
            avatar_url: ''
          }
        }
      })
      await expect(wrapper.find('#balance_display_usercard').element.innerHTML.includes('Oweing you: 0.10€')).toBe(true)
    })
  })
})
