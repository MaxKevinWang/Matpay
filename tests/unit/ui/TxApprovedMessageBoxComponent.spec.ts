import { config, shallowMount } from '@vue/test-utils'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { room_01_room_id, user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import { sum_amount, to_currency_display } from '@/utils/utils'

describe('Test TxApprovedMessageBox Interface', () => {
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      to_currency_display: to_currency_display
    }
  })
  const reference : TxApprovedPlaceholder = {
    type: 'approved',
    timestamp: new Date('1/15/2022'),
    grouped_tx: {
      from: user_1,
      group_id: 'abc',
      state: 'approved',
      txs: [{
        to: user_2,
        tx_id: 'abcd',
        amount: 50
      }, {
        to: user_3,
        tx_id: 'abce',
        amount: 45
      }],
      description: 'Schnitzel',
      timestamp: new Date('1/15/2022'),
      pending_approvals: []
    }
  }
  it('Test correct display', async () => {
    const wrapper = shallowMount(TxApprovedMessageBox, {
      props: {
        reference: reference
      }
    })
    const date = new Date('1/15/2022')
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(date.toLocaleDateString())).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('Schnitzel')).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(user_1.displayname + ' paid ')).length).toBe(1)
  })
  it('Test pressing Details redirects', async () => {
    let redirected = false
    const wrapper = shallowMount(TxApprovedMessageBox, {
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
