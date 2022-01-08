import store from '@/store/tx'
import axios from 'axios'
import { test_account1, test_homeserver } from '../../test_utils'
import { room_01_room_id, room_01_user_info } from '../mocks/mocked_user'
import { tx1 } from '../mocks/mocked_tx'
import { cloneDeep } from 'lodash'

describe('Test transaction Vuex store', () => {
  describe('Test actions', () => {
    beforeAll(() => {
      axios.interceptors.request.use(function (config) {
        if (!config.headers) {
          config.headers = {}
        }
        config.headers.Authorization = 'Bearer ' + test_account1.access_token
        return config
      }, function (error) {
        return Promise.reject(error)
      })
    })
    describe('Test action tx creation', () => {
      it('Test sending tx creation', async () => {
        const action = store.actions.action_create_tx_for_room as (context: any, payload: any) => Promise<any>
        const rootGetters = {
          'user/get_users_info_for_room': () => room_01_user_info,
          'tx/get_grouped_transactions_for_room': () => [],
          'tx/get_pending_approvals_for_room': () => [],
          'auth/user_id': test_account1.username,
          'auth/homeserver': test_homeserver
        }
        const dispatch = (action_name: string) => {
          if (action_name === 'auth/action_get_next_event_txn_id') {
            return 0
          }
        }
        const tx1_create = cloneDeep(tx1)
        tx1.group_id = ''
        tx1.txs[0].tx_id = ''
        tx1.state = 'defined'
        await action({
          state: null,
          commit: null,
          dispatch: dispatch,
          rootGetters: rootGetters
        }, {
          room_id: room_01_room_id,
          tx: tx1
        })
      })
    })
  })
})
