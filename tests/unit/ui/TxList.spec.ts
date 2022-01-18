import { newStore } from '@/store/index'
import { Room } from '@/models/room.model'
import { config, mount, shallowMount } from '@vue/test-utils'
import TxList from '@/components/TxList.vue'
import Login from '@/tabs/Login.vue'
import { user_1, user_2, user_3 } from '../mocks/mocked_user'
import { GroupID, TxID } from '@/models/id.model'
import { User } from '@/models/user.model'
import { PendingApproval, SimpleTransaction } from '@/models/transaction.model'
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
  it('Test if the component shows information correctly', () => {
    const wrapper = shallowMount(TxList, {
      global: {
        plugins: [store]
      },
      props: {
        tx_list: [
          {
            from: user_1,
            group_id: uuidgen(),
            state: 'approved',
            txs: [],
            description: 'Title',
            participants: [],
            timestamp: new Date('1/15/2022'),
            pending_approvals: []
          }
        ]
      }
    })
  })
})
