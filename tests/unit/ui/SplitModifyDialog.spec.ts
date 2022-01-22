import { newStore } from '@/store/index'
import { config, mount, shallowMount } from '@vue/test-utils'
import SplitModifyDialog from '@/dialogs/SplitModifyDialog.vue'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import TxList from '@/components/TxList.vue'
import { User } from '@/models/user.model'
import { TxID } from '@/models/id.model'
import { user_2, user_3 } from '../mocks/mocked_user'
import bootstrap from 'bootstrap'

jest.mock('bootstrap')
const mockedBootstrap = bootstrap as jest.Mocked<typeof bootstrap>
describe('Test SplitModifyDialog', () => {
  let store = newStore()
  let popover_percentage = false
  beforeEach(() => {
    store = newStore()
    mockedBootstrap.Popover.mockImplementationOnce(function (element, options) {
      popover_percentage = true
      return new bootstrap.Popover(element, options)
    })
    popover_percentage = false
  })
  beforeAll(() => {
    config.global.mocks = {
      sum_amount: sum_amount,
      split_percentage: split_percentage,
      to_currency_display: to_currency_display
    }
  })
  it('Test display single_tx', () => {
    const fake_tx_id1 = uuidgen()
    const fake_tx_id2 = uuidgen()
    const wrapper = shallowMount(SplitModifyDialog, {
      global: {
        plugins: [store]
      },
      props: {
        simple_txs: [
          {
            to: user_2,
            tx_id: fake_tx_id1,
            amount: 10
          },
          {
            to: user_3,
            tx_id: fake_tx_id2,
            amount: 10
          }
        ],
        current_split: {
          fake_tx_id1: 50,
          fake_tx_id2: 50
        }
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === fake_tx_id1)
    const tx2 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === fake_tx_id2)
    expect(tx1[0].element.innerHTML.includes('DSN Test Account No 2')).toBeTruthy()
    expect(tx2[0].element.innerHTML.includes('DSN Test Account No 3')).toBeTruthy()
    expect((tx1[0].find(`#split-perc${fake_tx_id1}`).element as HTMLInputElement).value).toEqual(50) // TODO: Still return empty string
    expect((tx2[0].find(`#split-perc${fake_tx_id2}`).element as HTMLInputElement).value).toEqual(50)
  })
  it('Test whether error pops up if input is not number', async () => {
    const fake_tx_id1 = uuidgen()
    const wrapper = shallowMount(SplitModifyDialog, {
      global: {
        plugins: [store]
      },
      props: {
        simple_txs: [
          {
            to: user_2,
            tx_id: fake_tx_id1,
            amount: 10
          }
        ],
        current_split: {
          fake_tx_id1: 100
        }
      }
    })
    const tx1 = wrapper.findAll('.input-group').filter(w => w.attributes('data-test') === fake_tx_id1)
    await tx1[0].find(`#split-perc${fake_tx_id1}`).setValue('asdasd')
    await wrapper.find('#save-trigger').trigger('click')
    expect(popover_percentage).toBeTruthy()
  })
  it('Test whether error pops up if input is not number', async () => {
    const fake_tx_id1 = uuidgen()
    const wrapper = shallowMount(SplitModifyDialog, {
      global: {
        plugins: [store]
      },
      props: {
        simple_txs: [
          {
            to: user_2,
            tx_id: fake_tx_id1,
            amount: 10
          }
        ],
        current_split: {
          fake_tx_id1: 100
        }
      }
    })
    await wrapper.find(`#split-perc${fake_tx_id1}`).setValue(50)
    await wrapper.find('#save-trigger').trigger('click')
    expect(popover_percentage).toBeTruthy()
  })
  it('Test emit', async () => {
    const fake_tx_id1 = uuidgen()
    const wrapper = shallowMount(SplitModifyDialog, {
      global: {
        plugins: [store]
      },
      props: {
        simple_txs: [
          {
            to: user_2,
            tx_id: fake_tx_id1,
            amount: 10
          }
        ],
        current_split: {
          fake_tx_id1: 100
        }
      }
    })
    await wrapper.find('#save-trigger').trigger('click')
    expect(wrapper.emitted()).toHaveProperty('on-save-split')
  })
})
