import { config, flushPromises, mount } from '@vue/test-utils'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import { sum_amount, to_currency_display } from '@/utils/utils'
import { createRouter, createWebHistory } from 'vue-router'
import RoomTxHistory from '@/views/RoomTxHistory.vue'
import RoomDetail from '@/views/RoomDetail.vue'

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
    const wrapper = mount(TxApprovedMessageBox, {
      props: {
        reference: reference
      }
    })
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('15.1.2022')).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes('Schnitzel')).length).toBe(1)
    await expect(wrapper.findAll('p').filter(i => i.element.innerHTML.includes(user_1.displayname + ' paid ')).length).toBe(1)
  })
  it('Test pressing Details redirects', async () => {
    jest.mock('@/views/RoomTxHistory.vue', () => ({
      name: 'RoomTxHistory',
      template: '<div />'
      // script:
    }))
    const router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: '/history/:room_id/:current_group_id?',
          name: 'room_history',
          component: RoomTxHistory
        },
        {
          path: '/room/:room_id',
          name: 'room_detail',
          component: RoomDetail
        }
      ]
    })
    await router.push('/room/aaa')
    await router.isReady()
    const wrapper = mount(TxApprovedMessageBox, {
      props: {
        reference: reference,
        room_id: 'aaa'
      },
      global: {
        plugins: [router]
      }
    })
    await wrapper.find('a').trigger('click')
    await flushPromises()
    expect(wrapper.html()).toContain('<div />')
  })
})
