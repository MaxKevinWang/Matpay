import { newStore } from '@/store/index'
import { config, mount, shallowMount } from '@vue/test-utils'
import SettlementDialog from '@/dialogs/SettlementDialog.vue'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import bootstrap from 'bootstrap'

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
  it('Test balance display', async () => {
    const wrapper = shallowMount(SettlementDialog, {
      global: {
        plugins: [store]
      }
    })
  })
})
