import { newStore } from '@/store'
import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import { selectorify, split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import {
  room_01_permission,
  room_01_user_info,
  room_02_permission,
  room_03_permission, room_04_user_info,
  user_1,
  user_2
} from '../mocks/mocked_user'
import MemberList from '@/components/MemberList.vue'
import { createStore } from 'vuex'
import bootstrap from 'bootstrap'
import UserInviteDialog from '@/dialogs/UserInviteDialog.vue'
import UserCard from '@/components/UserCard.vue'
import { MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { cloneDeep } from 'lodash'
import { PropType } from 'vue'

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
      to_currency_display: to_currency_display,
      selectorify: selectorify
    }
  })
  describe('Test component UI', () => {
    it('Test if the members and their basic infos are shown correctly', async () => {
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
      const wrapper = mount(MemberList, {
        global: {
          stubs: {
            UserInviteDialog: true,
            ConfirmDialog: true,
            SettleDialog: true
          },
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
      await flushPromises()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes(user_1.displayname)).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Yourself')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_1.user_id)).element.innerHTML.includes('Member')).toBeTruthy()
      expect(wrapper.find('#usercard_' + selectorify(user_2.user_id)).element.innerHTML.includes(user_2.displayname)).toBeTruthy()
      // const list1 = wrapper.find('.clearfix').filter(i => i.attributes('data-test') === user_1.user_id)
      // expect(list1[0].find('#"\'usercard_\' + user_id"').element.innerHTML.includes(user_1.displayname)).toBeTruthy()
    })
  })
  describe('Test PermissionDialog', () => {
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
    it('Test the user lacks sufficient to invite others', async () => {
      const store = createStore({
        modules: {
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn()
            }
          },
          user: {
            namespaced: true,
            actions: {
              action_change_user_membership_on_room: () => { throw Error }
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
      await wrapper.find('#invite-userid').setValue('@test-3:dsn.tm.kit.edu')
      await wrapper.find('#invite-confirm').trigger('click')
      expect(popover_description_called).toBeTruthy()
      // expect(wrapper.emitted()).toHaveProperty('on-error')
      // expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Error, something is fucked'))
    })
    it('Test the invite_dialog shows up(emit error1)', async () => {
      const store = createStore({
        modules: {
          rooms: {
            namespaced: true,
            getters: {
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn()
            }
          },
          user: {
            namespaced: true,
            getters: {
              get_permissions_for_room: () => (room_id: MatrixRoomID) => {
                return cloneDeep(room_01_permission)
              }
            }
          },
          tx: {
            namespaced: true,
            getters: {
              get_open_balance_against_user_for_room: () => () => 10
            }
          }
        }
      })
      const wrapper = mount(MemberList, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          stubs: {
            UserCard: true,
            ConfirmDialog: true
          },
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          users_info: room_01_user_info
        }
      })
      await wrapper.find('#inviteButton').trigger('click')
      await flushPromises()
      expect(wrapper.emitted()).toHaveProperty('on-error')
      expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual('You have no permission to invite user')
    })
    it('Test the invite_dialog shows up(emit error2)', async () => {
      const store = createStore({
        modules: {
          rooms: {
            namespaced: true,
            getters: {
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn()
            }
          },
          user: {
            namespaced: true,
            getters: {
              get_permissions_for_room: () => (room_id: MatrixRoomID) => {
                return cloneDeep(room_02_permission)
              }
            }
          },
          tx: {
            namespaced: true,
            getters: {
              get_open_balance_against_user_for_room: () => () => 10
            }
          }
        }
      })
      const wrapper = mount(MemberList, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          stubs: {
            UserCard: true,
            ConfirmDialog: true
          },
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          users_info: room_01_user_info
        }
      })
      await wrapper.find('#inviteButton').trigger('click')
      await flushPromises()
      expect(wrapper.emitted()).toHaveProperty('on-error')
      expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual('You have no permission to invite user')
    })
    it('Test the invite_dialog shows up(no error)', async () => {
      const store = createStore({
        modules: {
          rooms: {
            namespaced: true,
            getters: {
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn()
            }
          },
          user: {
            namespaced: true,
            getters: {
              get_permissions_for_room: () => (room_id: MatrixRoomID) => {
                return cloneDeep(room_03_permission)
              }
            }
          },
          tx: {
            namespaced: true,
            getters: {
              get_open_balance_against_user_for_room: () => () => 10
            }
          }
        }
      })
      const wrapper = mount(MemberList, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          stubs: {
            UserCard: true,
            ConfirmDialog: true
          },
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          users_info: room_01_user_info
        }
      })
      await wrapper.find('#inviteButton').trigger('click')
      await flushPromises() // user-invite-modal
      await expect(wrapper.find('#user-invite-modal').element.innerHTML.includes('@user:')).toEqual(true)
    })
    it('Test the on_kick + confirm dialog', async () => {
      const store = createStore({
        modules: {
          rooms: {
            namespaced: true,
            getters: {
            }
          },
          auth: {
            namespaced: true,
            getters: {
              is_logged_in: () => true,
              user_id: () => user_1.user_id,
              homeserver: jest.fn()
            }
          },
          user: {
            namespaced: true,
            getters: {
              get_permissions_for_room: () => (room_id: MatrixRoomID) => {
                return cloneDeep(room_03_permission)
              }
            }
          },
          tx: {
            namespaced: true,
            getters: {
              get_open_balance_against_user_for_room: () => () => 10
            }
          }
        }
      })
      const wrapper = mount(MemberList, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          room_id: 'fake_room_id',
          can_i_kick_user: true,
          users_info: room_04_user_info
        }
      })
      await (wrapper.find('#usercard_' + selectorify(user_2.user_id)).find('#kickButton')).trigger('click')
      await flushPromises()
      // expect(wrapper.emitted()).toHaveProperty('on-kick')
      // expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Error, something is fucked'))
      await expect(wrapper.find('#confirm-modal').element.innerHTML.includes('want to kick user?')).toEqual(true)
    })
  })
})
