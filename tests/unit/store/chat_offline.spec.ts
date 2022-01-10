import store from '@/store/chat'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID } from '@/models/id.model'
import { ChatLog, ChatMessage, TxApprovedPlaceholder, TxPendingPlaceholder, TxPlaceholder } from '@/models/chat.model'
import { User } from '@/models/user.model'
import { room_01_user_info, user_1 } from '../mocks/mocked_user'
import { MatrixRoomChatMessageEvent } from '@/interface/rooms_event.interface'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { uuidgen } from '@/utils/utils'

interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
}

describe('Test chat store', function () {
  describe('Test store mutation', function () {
    let state : State = {
      chat_log: {
        aaa: {
          messages: []
        }
      }
    }
    beforeEach(() => {
      state = {
        chat_log: {
          aaa: {
            messages: []
          }
        }
      }
    })
    it('Test mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      state.chat_log = {}
      mutation(state, 'aaa')
      expect(state.chat_log.aaa.messages).toEqual([])
    })
    it('Test mutation_add_single_message_for_room', function () {
      const mutation = store.mutations.mutation_add_single_message_for_room
      const fake_group_id1 = uuidgen()
      const fake_group_id2 = uuidgen()
      const fake_msg: ChatMessage = {
        sender: user_1,
        content: '',
        timestamp: new Date()
      }
      const fake_group_tx_previous_Approved: GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id1,
        state: 'approved',
        txs: [],
        description: '',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_group_tx_Approved: GroupedTransaction = {
        from: user_1,
        group_id: fake_group_id1,
        state: 'approved',
        txs: [],
        description: 'Overwritten',
        participants: [],
        timestamp: new Date(),
        pending_approvals: []
      }
      const fake_pending_approval_previous: PendingApproval = {
        event_id: 'e01',
        type: 'create',
        group_id: fake_group_id2,
        approvals: {},
        from: user_1,
        description: '',
        timestamp: new Date(),
        txs: []
      }
      const fake_pending_approval: PendingApproval = {
        event_id: 'e01',
        type: 'create',
        group_id: fake_group_id2,
        approvals: {},
        from: user_1,
        description: 'Overwritten',
        timestamp: new Date(),
        txs: []
      }
      const fake_msg_TX_previous_Approved: TxApprovedPlaceholder = {
        type: 'approved',
        timestamp: new Date(),
        grouped_tx: fake_group_tx_previous_Approved
      }
      const fake_msg_TX_Approved: TxApprovedPlaceholder = {
        type: 'approved',
        timestamp: new Date(),
        grouped_tx: fake_group_tx_Approved
      }
      const fake_msg_pending_approval_previous: TxPendingPlaceholder = {
        type: 'pending',
        timestamp: new Date(),
        approval: fake_pending_approval_previous
      }
      const fake_msg_pending_approval: TxPendingPlaceholder = {
        type: 'pending',
        timestamp: new Date(),
        approval: fake_pending_approval
      }
      mutation(state, { room_id: 'aaa', msg: fake_msg })
      // Test whether ChatMessage is added
      expect(state.chat_log.aaa.messages[0]).toEqual(fake_msg)
      // Test whether transaction messages overwrite previous ones with the same group ID
      state.chat_log.aaa.messages = []
      // Test TxApprovedPlaceholder
      state.chat_log.aaa.messages.push(fake_msg_TX_previous_Approved)
      mutation(state, { room_id: 'aaa', msg: fake_msg_TX_Approved })
      expect(state.chat_log.aaa.messages[0]).toEqual(fake_msg_TX_Approved)
      state.chat_log.aaa.messages = []
      // Test TxPendingPlaceholder
      state.chat_log.aaa.messages.push(fake_msg_pending_approval_previous)
      mutation(state, { room_id: 'aaa', msg: fake_msg_pending_approval })
      expect(state.chat_log.aaa.messages[0]).toEqual(fake_msg_pending_approval)
      // Test sorting with timestamp
      state.chat_log.aaa.messages = []
      fake_msg_TX_Approved.timestamp.setTime(100)
      fake_msg.timestamp.setTime(200)
      state.chat_log.aaa.messages.push(fake_msg)
      mutation(state, { room_id: 'aaa', msg: fake_msg_TX_Approved })
      expect(state.chat_log.aaa.messages[0]).toEqual(fake_msg_TX_Approved)
    })
    it('Test mutation_reset_state', function () {
      const mutation = store.mutations.mutation_reset_state
      const fake_msg: ChatMessage = {
        sender: user_1,
        content: '',
        timestamp: new Date()
      }
      state.chat_log.aaa.messages.push(fake_msg)
      mutation(state)
      expect(state.chat_log).toEqual({})
    })
  })
  describe('Test store getters', function () {
    let state : State = {
      chat_log: {
        aaa: {
          messages: []
        }
      }
    }
    beforeEach(() => {
      state = {
        chat_log: {
          aaa: {
            messages: []
          }
        }
      }
    })
    it('Test getters get_chat_log_for_room', function () {
      const getter = store.getters.get_chat_log_for_room(state, null, null, null)
      const fake_msg: ChatMessage = {
        sender: user_1,
        content: '',
        timestamp: new Date()
      }
      state.chat_log.aaa.messages.push(fake_msg)
      expect(getter('aaa')).toEqual(state.chat_log.aaa)
    })
  })
  describe('Test store action', () => {
    const room_id = 'aaa'
    let state: State = {
      chat_log: {
        aaa: {
          messages: []
        }
      }
    }
    const rootGetters = {
      'user/get_users_info_for_room': (r: MatrixRoomID) => {
        if (r === room_id) {
          return room_01_user_info
        }
      }
    }
    beforeEach(() => {
      state = {
        chat_log: {
          aaa: {
            messages: []
          }
        }
      }
    })
    describe('Test parse_single_chat_message_event_for_room', () => {
      const action = store.actions.action_parse_single_chat_message_event_for_room as (context: any, payload: any) => Promise<boolean>
      it('Test message correct', async () => {
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        const event: MatrixRoomChatMessageEvent = {
          type: 'm.room.message',
          sender: user_1.user_id,
          room_id: 'aaa',
          event_id: 'e01',
          content: {
            msgtype: 'm.text',
            body: 'hello',
            format: '',
            formatted_body: ''
          },
          origin_server_ts: 60000
        }
        let commit_called = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          msg: ChatMessage
        }) => {
          if (commit_string === 'mutation_add_single_message_for_room' && payload.msg.content === 'hello' && payload.msg.sender === user_1) {
            commit_called = true
          }
        }
        await action({
          state,
          commit: commit,
          dispatch: jest.fn(),
          getters: getter,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          message_event: event
        })
        expect(commit_called).toBeTrue()
      })
    })
  })
})
