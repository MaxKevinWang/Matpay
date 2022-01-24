import { newStore } from '@/store/index'
import { config, mount, shallowMount } from '@vue/test-utils'
import SplitCreateDialog from '@/dialogs/SplitCreateDialog.vue'
import { split_percentage, sum_amount, to_currency_display } from '@/utils/utils'

describe('Test for SplitCreateDialog', () => {
  let store = newStore()
  beforeEach(() => {
    store = newStore()
  })
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      split_percentage: split_percentage,
      to_currency_display: to_currency_display
    }
  })
})
