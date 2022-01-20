import { newStore } from '@/store/index'
import { config, mount, shallowMount } from '@vue/test-utils'
import SplitModifyDialog from '@/dialogs/SplitModifyDialog.vue'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import RoomTxHistory from '@/views/RoomTxHistory.vue'
import bootstrap from 'bootstrap'

describe('Test RoomTxHistory', () => {
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
  it('Test whether RoomName is displayed', () => {

  })
})
