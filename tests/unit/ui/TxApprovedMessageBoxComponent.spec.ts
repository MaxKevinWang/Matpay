import { config, flushPromises, mount } from '@vue/test-utils'
import TxApprovedMessageBox from '@/components/TxApprovedMessageBox.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import { sum_amount, to_currency_display } from '@/utils/utils'
import { createRouter, createWebHistory } from 'vue-router'
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
    const mockRoute = {
      name: 'room_history',
      params: {
        room_id: 'aaa',
        group_id: 'abc'
      }
    }
    const mockRouter = {
      push: jest.fn()
    }
    const wrapper = mount(TxApprovedMessageBox, {
      props: {
        reference: reference,
        room_id: 'aaa'
      },
      global: {
        mocks: {
          $route: mockRoute,
          $router: mockRouter
        }
      }
    })
    await wrapper.find('router-link').trigger('click')
    expect(mockRouter.push).toHaveBeenCalledTimes(1)
    expect(mockRouter.push).toHaveBeenCalledWith('/history/aaa/abc')
  })
})
