import { newStore } from '@/store/index'
import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import TxDetail from '@/components/TxDetail.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import ModificationDialog from '@/dialogs/ModificationDialog.vue'
import bootstrap from 'bootstrap'
import { createStore } from 'vuex'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>
describe('Test TxDetail Component', () => {
  let popover_description_called = false
  let popover_amount_called = false
  let store = newStore()
  beforeEach(() => {
    store = newStore()
    mockedBootstrap.Popover.mockImplementationOnce(function (element, options) {
      if (element === '#input-description-modification') {
        popover_description_called = true
      } else if (element === '#input-amount-modification') {
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
      to_currency_display: to_currency_display
    }
  })
  describe('Test component UI', () => {
    it('Test if the component does not render when the tx is undefined', async () => {
      const wrapper = shallowMount(TxDetail, {
        props: {
          tx: undefined
        }
      })
      expect(wrapper.find('#TXDetail-header').exists()).toBe(false)
      expect(wrapper.find('#TXDetail-body').exists()).toBe(false)
      expect(wrapper.find('#ModificationButton-body').exists()).toBe(false)
    })
    it('Test if the component render when the tx is defined', async () => {
      const wrapper = shallowMount(TxDetail, {
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10000
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          }
        }
      })
      await flushPromises()
      await expect(wrapper.find('#TXDetail-header').classes('modal-open')).toBe(false)
      expect(wrapper.findAll('[data-test="todo"]')).toHaveLength(1)
    })
    it('Test if the user can click on modification button when he is participant', async () => {
      store.state.auth.user_id = user_1.user_id
      const wrapper = shallowMount(TxDetail, {
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          }
        }
      })
      expect((wrapper.find('#ModificationButton-body').element as HTMLButtonElement).disabled).toBeFalsy()
    })
    it('Test if the user can not click on modification button when he is not participant', async () => {
      store.state.auth.user_id = user_3.user_id
      const wrapper = shallowMount(TxDetail, {
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          }
        }
      })
      expect((wrapper.find('#modification-button').element as HTMLButtonElement).disabled).toEqual(true)
    })
    /*
    it('Test if the user can not click on modification button tx is frozen', async () => {
      store.state.auth.user_id = user_2.user_id
      const wrapper = shallowMount(TxDetail, {
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'frozen',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          }
        }
      })
      expect((wrapper.find('#ModificationButton-body').element as HTMLButtonElement).disabled).toEqual(true)
    })
     */
    it('Test emit on-error', async () => {
      const store2 = createStore({
        modules: {
          tx: {
            namespaced: true,
            actions: {
              action_modify_tx_for_room: () => { throw new Error('Error, something is fucked') }
            }
          },
          user: {
            namespaced: true,
            getters: {
              get_users_info_for_room: () => jest.fn()
            }
          }
        }
      })
      const wrapper = mount(TxDetail, {
        attachTo: 'body',
        global: {
          plugins: [store2]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          }
        }
      })
      await wrapper.find('#modification-button').trigger('click')
      await flushPromises()
      await wrapper.find('#modify-confirm').trigger('click')
      await flushPromises()
      expect(wrapper.emitted()).toHaveProperty('on-error')
      expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Error, something is fucked'))
    })
  })
  describe('Test ModificationDialog', () => {
    it('Test empty input', async () => {
      const wrapper = shallowMount(ModificationDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          },
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
      await wrapper.find('#input-description-modification').setValue('')
      await wrapper.find('#modify-confirm').trigger('click')
      expect(popover_description_called).toBeTruthy()
    })
    it('Test wrong amount input', async () => {
      const wrapper = shallowMount(ModificationDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          },
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
      await wrapper.find('#input-amount-modification').setValue('asdasd')
      await wrapper.find('#modify-confirm').trigger('click')
      expect(popover_amount_called).toBeTruthy()
    })
    it('Test empty description', async () => {
      const wrapper = shallowMount(ModificationDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 10
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          },
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
      await wrapper.find('#input-description-modification').setValue('')
      await wrapper.find('#modify-confirm').trigger('click')
      expect(popover_description_called).toBeTruthy()
    })
    it('Test default description shows', async () => {
      const wrapper = shallowMount(ModificationDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 1000
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          },
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
      const default_description = wrapper.find('#input-description-modification')
      const default_amount = wrapper.find('#input-amount-modification')
      expect((default_description.element as HTMLInputElement).value).toEqual('Title')
      expect((default_amount.element as HTMLInputElement).value).toEqual('10')
    })
    it('Test emit on-error', async () => {
      const store2 = createStore({
        modules: {
          tx: {
            namespaced: true,
            actions: {
              action_modify_tx_for_room: () => { throw new Error('Error, something is fucked') }
            }
          }
        }
      })
      const wrapper = shallowMount(ModificationDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        global: {
          plugins: [store2]
        },
        props: {
          tx: {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [
              {
                to: user_2,
                tx_id: uuidgen(),
                amount: 1000
              }
            ],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          },
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
      await wrapper.find('#modify-confirm').trigger('click')
      expect(wrapper.emitted()).toHaveProperty('on-error')
      expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Error, something is fucked'))
    })
  })
})
