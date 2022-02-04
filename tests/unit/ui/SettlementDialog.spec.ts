import { newStore } from '@/store/index'
import { config, shallowMount } from '@vue/test-utils'
import SettlementDialog from '@/dialogs/SettlementDialog.vue'
import { selectorify, split_percentage, sum_amount, to_currency_display } from '@/utils/utils'
import { user_1 } from '../mocks/mocked_user'

describe('Test SettlementDialog', () => {
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
  it('Test balance positiv display', async () => {
    const wrapper = shallowMount(SettlementDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        user_clicked: {
          user: user_1,
          displayname: user_1.displayname,
          user_type: 'Admin',
          is_self: true
        },
        balance: 10
      }
    })
    await expect(wrapper.find('#you-owe').element.innerHTML.includes('You owe:')).toEqual(true)
    await expect(wrapper.find('h3').element.innerHTML.includes('10')).toEqual(true)
  })
  it('Test balance negative display', async () => {
    const wrapper = shallowMount(SettlementDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        user_clicked: {
          user: user_1,
          displayname: user_1.displayname,
          user_type: 'Admin',
          is_self: true
        },
        balance: -10
      }
    })
    await expect(wrapper.find('#owe-you').element.innerHTML.includes('Owing you: ')).toEqual(true)
    await expect(wrapper.find('h3').element.innerHTML.includes('10')).toEqual(true)
  })
  it('Test button disabled', async () => {
    const wrapper = shallowMount(SettlementDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        user_clicked: {
          user: user_1,
          displayname: user_1.displayname,
          user_type: 'Admin',
          is_self: true
        },
        balance: 10
      }
    })
    expect((wrapper.find('#settle-button').element as HTMLButtonElement).disabled).toEqual(true)
  })
  it('Test emit', async () => {
    const wrapper = shallowMount(SettlementDialog, {
      attachTo: 'body',
      global: {
        plugins: [store]
      },
      props: {
        user_clicked: {
          user: user_1,
          displayname: user_1.displayname,
          user_type: 'Admin',
          is_self: true
        },
        balance: -10
      }
    })
    wrapper.find('#settle-button').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('on-settle')
  })
})
