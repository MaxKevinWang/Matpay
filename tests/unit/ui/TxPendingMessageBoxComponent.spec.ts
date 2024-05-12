import { config, flushPromises, mount, shallowMount } from '@vue/test-utils'
import TxPendingMessageBox from '@/components/TxPendingMessageBox.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxPendingPlaceholder } from '@/models/chat.model'
import { split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { createStore } from 'vuex'
import ApprovalDialog from '@/dialogs/ApprovalDialog.vue'

describe('Test TxApprovedMessageBox Interface', () => {
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      to_currency_display: to_currency_display,
      split_percentage: split_percentage
    }
  })
  const reference : TxPendingPlaceholder = {
    type: 'pending',
    timestamp: new Date('1/15/2022'),
    approval: {
      event_id: 'aaa',
      type: 'create',
      group_id: 'bbb',
      approvals: {
        '@test-2:dsn.tm.kit.edu': true,
        '@test-3:dsn.tm.kit.edu': false
      },
      from: user_1,
      timestamp: new Date('1/15/2022'),
      description: 'Schnitzel',
      txs: [
        {
          to: user_2,
          tx_id: 'ccc',
          amount: 1500
        },
        {
          to: user_3,
          tx_id: 'ddd',
          amount: 1250
        }
      ]
    }
  }
  it('Test contains all attributes', async () => {
    const wrapper = shallowMount(TxPendingMessageBox, {
      props: {
        reference: reference
      }
    })
    const date = new Date('1/15/2022')
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(date.toLocaleDateString())).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('Schnitzel')).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(user_1.displayname + ' paid 27.50€')).length).toBe(1)
  })
  it('Test store is updated after approval', async () => {
    let action_called = false
    const store = createStore({
      modules: {
        tx: {
          namespaced: true,
          actions: {
            action_approve_tx_for_room: () => { action_called = true }
          }
        },
        auth: {
          namespaced: true,
          getters: {
            user_id: () => user_3.user_id
          }
        }
      }
    })
    const wrapper = mount(TxPendingMessageBox, {
      global: {
        plugins: [store]
      },
      attachTo: 'body',
      props: {
        reference: reference
      }
    })
    await flushPromises()
    await wrapper.find('.PenMesDetailButton').trigger('click')
    expect(wrapper.vm.$refs.approve_dialog.is_shown).toBeTruthy()
    await wrapper.find('.ApproveBTN').trigger('click')
    expect(action_called).toBe(true)
  })
  it('Test action when approved throws', async () => {
    const store = createStore({
      modules: {
        tx: {
          namespaced: true,
          actions: {
            action_approve_tx_for_room: () => { throw new Error('Action failed') }
          }
        },
        auth: {
          namespaced: true,
          getters: {
            user_id: () => user_3.user_id
          }
        }
      }
    })
    const wrapper = mount(TxPendingMessageBox, {
      global: {
        plugins: [store]
      },
      attachTo: 'body',
      props: {
        reference: reference
      }
    })
    await flushPromises()
    await wrapper.find('.PenMesDetailButton').trigger('click')
    await wrapper.find('.ApproveBTN').trigger('click')
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty('on-error')
    expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Action failed'))
  })
  it('Test action after rejection throws', async () => {
    const store = createStore({
      modules: {
        tx: {
          namespaced: true,
          actions: {
            action_reject_tx_for_room: () => { throw new Error('Action failed') }
          }
        },
        auth: {
          namespaced: true,
          getters: {
            user_id: () => user_3.user_id
          }
        }
      }
    })
    const wrapper = mount(TxPendingMessageBox, {
      global: {
        plugins: [store]
      },
      attachTo: 'body',
      props: {
        reference: reference
      }
    })
    await flushPromises()
    await wrapper.find('.PenMesDetailButton').trigger('click')
    await wrapper.find('.RejectBTN').trigger('click')
    await flushPromises()
    expect(wrapper.emitted()).toHaveProperty('on-error')
    expect((wrapper.emitted()['on-error'][0] as Array<Error>)[0]).toEqual(Error('Action failed'))
    expect(wrapper.vm.$refs.approve_dialog.is_shown).toBeFalsy()
  })
  it('Test action after rejection works', async () => {
    let action_called = false
    const store = createStore({
      modules: {
        tx: {
          namespaced: true,
          actions: {
            action_reject_tx_for_room: () => { action_called = true }
          }
        },
        auth: {
          namespaced: true,
          getters: {
            user_id: () => user_3.user_id
          }
        }
      }
    })
    const wrapper = mount(TxPendingMessageBox, {
      global: {
        plugins: [store]
      },
      attachTo: 'body',
      props: {
        reference: reference
      }
    })
    await flushPromises()
    await wrapper.find('.PenMesDetailButton').trigger('click')
    await wrapper.find('.RejectBTN').trigger('click')
    await flushPromises()
    expect(action_called).toBeTruthy()
  })
  it('Jump to previous emits', async () => {
    const modify_reference : TxPendingPlaceholder = {
      type: 'pending',
      timestamp: new Date('1/15/2022'),
      approval: {
        event_id: 'aaa',
        type: 'modify',
        group_id: 'bbb',
        approvals: {
          '@test-2:dsn.tm.kit.edu': true,
          '@test-3:dsn.tm.kit.edu': false
        },
        from: user_1,
        timestamp: new Date('1/15/2022'),
        description: 'Schnitzel',
        txs: [
          {
            to: user_2,
            tx_id: 'ccc',
            amount: 1500
          },
          {
            to: user_3,
            tx_id: 'ddd',
            amount: 1250
          }
        ]
      }
    }
    const wrapper = shallowMount(TxPendingMessageBox, {
      attachTo: 'body',
      props: {
        reference: modify_reference
      }
    })
    await flushPromises()
    await wrapper.find('.PreviousBTN').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('on-previous')
    expect(wrapper.emitted()['on-previous'][0]).toEqual([modify_reference.approval])
  })
  describe('Test ApprovalDialog', () => {
    const store_2 = createStore({
      modules: {
        auth: {
          namespaced: true,
          getters: {
            user_id: () => user_3.user_id
          }
        }
      }
    })
    it('Test the other user MUST see split configuration', async () => {
      const wrapper = shallowMount(ApprovalDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        props: {
          reference: reference,
          room_id: 'eee'
        },
        global: {
          plugins: [store_2]
        }
      })
      expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('45.45%')).length).toBe(1)
      expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('54.55%')).length).toBe(1)
    })
    it('Test user must see the transaction details', async () => {
      const wrapper = shallowMount(ApprovalDialog, {
        attachTo: document.querySelector('html') as HTMLElement,
        props: {
          reference: reference,
          room_id: 'eee'
        },
        global: {
          plugins: [store_2]
        }
      })
      expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(user_2.displayname + ' owe 15.00€')).length).toBe(1)
      expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(user_3.displayname + ' owe 12.50€')).length).toBe(1)
    })
  })
})
