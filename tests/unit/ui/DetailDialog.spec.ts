import { newStore } from '@/store/index'
import { config, flushPromises, shallowMount } from '@vue/test-utils'
import DetailDialog from '@/dialogs/DetailDialog.vue'
import { selectorify, split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import SettlementDialog from '@/dialogs/SettlementDialog.vue'
import { user_1, user_2 } from '../mocks/mocked_user'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import { GroupedTransaction, SimpleTransaction } from '@/models/transaction.model'
import { User } from '@/models/user.model'
import { MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { createStore } from 'vuex'

describe('Test DetailDialog', () => {
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
  it('Test correct display', async () => {
    const fake_group_id = uuidgen()
    const fake_tx_id = uuidgen()
    const fake_tx: SimpleTransaction = {
      to: user_2,
      tx_id: fake_tx_id,
      amount: 100
    }
    const fake_group_tx_Approved: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id,
      state: 'approved',
      txs: [fake_tx],
      description: 'Approved',
      participants: [],
      timestamp: new Date(),
      pending_approvals: []
    }
    const fake_msg_TX_Approved: TxApprovedPlaceholder = {
      type: 'approved',
      timestamp: new Date(),
      grouped_tx: fake_group_tx_Approved
    }
    const store1 = createStore({
      modules: {
        auth: {
          namespaced: true,
          getters: {
            is_logged_in: () => true,
            user_id: () => user_1.user_id
          }
        }
      }
    })
    const wrapper = shallowMount(DetailDialog, {
      attachTo: 'body',
      global: {
        plugins: [store1]
      },
      props: {
        room_id: 'aaa',
        reference: fake_msg_TX_Approved
      }
    })
    const tx = wrapper.findAll('.list-tab').filter(w => w.attributes('data-test') === fake_tx_id)
    // Test tx display
    expect(wrapper.findAll('.list-tab')).toHaveLength(1)
    expect(tx[0].find('.col-8').element.innerHTML.includes(fake_tx.to.displayname + ' owe ' + to_currency_display(fake_tx.amount))).toBeTruthy()
    expect(tx[0].find('.col-2').element.innerHTML.includes((split_percentage(fake_group_tx_Approved)[fake_tx_id] * 100).toFixed(2) + '%')).toBeTruthy()
  })
})
