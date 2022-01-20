import { newStore } from '@/store/index'
import { Room } from '@/models/room.model'
import { config, mount, shallowMount } from '@vue/test-utils'
import TxList from '@/components/TxList.vue'
import Login from '@/tabs/Login.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { GroupID, TxID } from '@/models/id.model'
import { User } from '@/models/user.model'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { split_percentage, sum_amount, to_currency_display, uuidgen } from '@/utils/utils'
import ModificationDialog from '@/dialogs/ModificationDialog.vue'
import { test_account2 } from '../../test_utils'
import bootstrap from 'bootstrap'
import { nextTick } from 'vue'

describe('Test Txlist Component', () => {
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
  it('Test if the component shows information correctly', () => {
    const fake_group_id1 = uuidgen()
    const fake_group_id2 = uuidgen()
    const group_tx1: GroupedTransaction = {
      from: user_1,
      group_id: fake_group_id1,
      state: 'approved',
      txs: [],
      description: 'Title',
      participants: [],
      timestamp: new Date('1/15/2022'),
      pending_approvals: []
    }
    const group_tx2: GroupedTransaction = {
      from: user_2,
      group_id: fake_group_id2,
      state: 'approved',
      txs: [],
      description: 'Title',
      participants: [],
      timestamp: new Date('1/15/2022'),
      pending_approvals: []
    }
    const wrapper = shallowMount(TxList, {
      global: {
        plugins: [store]
      },
      props: {
        tx_list: [
          group_tx1,
          group_tx2
        ]
      }
    })
    const tx1 = wrapper.findAll('.list-tab').filter(w => w.attributes('data-test') === fake_group_id1)
    const tx2 = wrapper.findAll('.list-tab').filter(w => w.attributes('data-test') === fake_group_id2)
    expect(wrapper.findAll('.list-tab')).toHaveLength(2)
    expect(tx1[0].element.innerHTML.includes('2022/1/15 Title: DSN Test Account No 1 paid 0€')).toBeTruthy()
    expect(tx2[0].element.innerHTML.includes('2022/1/15 Title: DSN Test Account No 2 paid 0€')).toBeTruthy()
  })
})
