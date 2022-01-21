import { config, shallowMount } from '@vue/test-utils'
import TxPendingMessageBox from '@/components/TxPendingMessageBox.vue'
import { room_01_room_id, user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxPlaceholder } from '@/models/chat.model'
import { sum_amount, to_currency_display } from '@/utils/utils'

describe('Test TxApprovedMessageBox Interface', () => {
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      to_currency_display: to_currency_display
    }
  })
  const reference : TxPlaceholder = {
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
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('15.1.2022')).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('Schnitzel')).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(user_1.displayname + ' paid 27.50€')).length).toBe(1)
  })
  it('Test pressing Details redirects', async () => {
    let redirected = false
    const wrapper = shallowMount(TxPendingMessageBox, {
      global: {
        mocks: {
          $router: {
            push: () => {
              redirected = true
            }
          }
        }
      },
      props: {
        reference: reference,
        room_id: room_01_room_id
      }
    })
    await wrapper.find('button').trigger('click')
    expect(redirected).toBe(true)
  })
})
