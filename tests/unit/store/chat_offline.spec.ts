import store from '@/store/chat'
import { MatrixEventID, MatrixRoomID } from '@/models/id.model'
import { ChatLog, ChatMessage, TxApprovedPlaceholder, TxPendingPlaceholder } from '@/models/chat.model'
import { room_01_user_info, user_1 } from '../mocks/mocked_user'
import { MatrixRoomChatMessageEvent } from '@/interface/rooms_event.interface'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'
import { uuidgen } from '@/utils/utils'
import axios from 'axios'
import { MatrixError } from '@/interface/error.interface'
import { TxRejectedEvent } from '@/interface/tx_event.interface'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

interface State {
  chat_log: Record<MatrixRoomID, ChatLog>,
  rejected_events: Record<MatrixRoomID, Set<MatrixEventID>>
}

describe('Test chat store', function () {
  describe('Test store mutation', function () {
    let state : State = {
      chat_log: {
        aaa: {
          messages: []
        }
      },
      rejected_events: {
        aaa: new Set()
      }
    }
    beforeEach(() => {
      state = {
        chat_log: {
          aaa: {
            messages: []
          }
        },
        rejected_events: {
          aaa: new Set()
        }
      }
    })
    it('Test mutation_init_joined_room', function () {
      const mutation = store.mutations.mutation_init_joined_room
      state.chat_log = {}
      mutation(state, 'aaa')
      expect(state.chat_log.aaa.messages).toEqual([])
    })
    it('Test mutation_set_rejected_events_for_room', function () {
      const mutation = store.mutations.mutation_set_rejected_events_for_room
      const fake_event_id = uuidgen()
      const fake_rejected_events: Array<MatrixEventID> = [fake_event_id]
      state.chat_log = {}
      mutation(state, { room_id: 'aaa', rejected_events: fake_rejected_events })
      expect(state.rejected_events.aaa).toEqual(new Set(fake_rejected_events))
    })
    it('Test mutation_remove_joined_room', function () {
      const mutation = store.mutations.mutation_remove_joined_room
      mutation(state, 'aaa')
      expect(state.chat_log.aaa).toEqual(undefined)
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
      fake_msg_pending_approval.timestamp.setTime(300)
      state.chat_log.aaa.messages.push(fake_msg)
      mutation(state, { room_id: 'aaa', msg: fake_msg_TX_Approved })
      mutation(state, { room_id: 'aaa', msg: fake_msg_pending_approval })
      expect(state.chat_log.aaa.messages[2]).toEqual(fake_msg_TX_Approved)
      expect(state.chat_log.aaa.messages[1]).toEqual(fake_msg)
      expect(state.chat_log.aaa.messages[0]).toEqual(fake_msg_pending_approval)
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
      },
      rejected_events: {
        aaa: new Set()
      }
    }
    beforeEach(() => {
      state = {
        chat_log: {
          aaa: {
            messages: []
          }
        },
        rejected_events: {
          aaa: new Set()
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
      },
      rejected_events: {
        aaa: new Set()
      }
    }
    const rootGetters = {
      'user/get_all_users_info_for_room': (r: MatrixRoomID) => {
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
        },
        rejected_events: {
          aaa: new Set()
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
        expect(commit_called).toBeTruthy()
      })
    })
    describe('Test action_parse_single_pending_approval_for_room', () => {
      const action = store.actions.action_parse_single_pending_approval_for_room as (context: any, payload: any) => Promise<boolean>
      it('Test message correct', async () => {
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        const fake_pending_approval: PendingApproval = {
          event_id: 'e01',
          from: user_1,
          group_id: uuidgen(),
          type: 'create',
          txs: [],
          description: '',
          approvals: {},
          timestamp: new Date()
        }
        let commit_called = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          msg: TxPendingPlaceholder
        }) => {
          if (commit_string === 'mutation_add_single_message_for_room' && payload.msg.approval === fake_pending_approval && payload.msg.timestamp === fake_pending_approval.timestamp) {
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
          pending_approval: fake_pending_approval
        })
        expect(commit_called).toBeTruthy()
      })
      it('Test event is rejected', async () => {
        const fake_id = uuidgen()
        state.rejected_events.aaa = new Set([fake_id])
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        const fake_pending_approval: PendingApproval = {
          event_id: fake_id,
          from: user_1,
          group_id: fake_id,
          type: 'create',
          txs: [],
          description: '',
          approvals: {},
          timestamp: new Date()
        }
        let commit_called = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          msg: TxPendingPlaceholder
        }) => {
          if (commit_string === 'mutation_add_single_message_for_room' && payload.msg.approval === fake_pending_approval && payload.msg.timestamp === fake_pending_approval.timestamp) {
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
          pending_approval: fake_pending_approval
        })
        expect(commit_called).toEqual(false)
      })
    })
    describe('Test action_parse_rejected_event_for_room', () => {
      const action = store.actions.action_parse_rejected_event_for_room as (context: any, payload: any) => Promise<boolean>
      it('Test message correct', async () => {
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        const fake_event_id = uuidgen()
        const fake_rejection: TxRejectedEvent = {
          state_key: '',
          type: 'com.matpay.rejected',
          sender: user_1.user_id,
          room_id: room_id,
          origin_server_ts: 60000,
          event_id: 'e01',
          content: {
            events: [fake_event_id]
          }
        }
        let commit_called = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          rejected_events: Array<MatrixEventID>
        }) => {
          if (commit_string === 'mutation_set_rejected_events_for_room' && payload.rejected_events === fake_rejection.content.events) {
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
          rejected_event: fake_rejection
        })
        expect(commit_called).toBeTruthy()
      })
    })
    describe('Test action_parse_single_grouped_tx_for_room', () => {
      const action = store.actions.action_parse_single_grouped_tx_for_room as (context: any, payload: any) => Promise<boolean>
      it('Test message correct', async () => {
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        const fake_grouped_tx: GroupedTransaction = {
          from: user_1,
          group_id: uuidgen(),
          state: 'approved',
          txs: [],
          description: '',
          participants: [],
          timestamp: new Date(),
          pending_approvals: []
        }
        let commit_called = false
        const commit = (commit_string: string, payload: {
          room_id: MatrixRoomID,
          msg: TxApprovedPlaceholder
        }) => {
          if (commit_string === 'mutation_add_single_message_for_room' && payload.msg.grouped_tx === fake_grouped_tx && payload.msg.timestamp === fake_grouped_tx.timestamp) {
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
          grouped_tx: fake_grouped_tx
        })
        expect(commit_called).toBeTruthy()
      })
    })
    describe('Test action_send_chat_message_for_room', () => {
      const action = store.actions.action_send_chat_message_for_room as (context: any, payload: any) => Promise<boolean>
      it('Test empty message', async () => {
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        await expect(() => action({
          state,
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getter,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          message: ''
        })).rejects.toThrow('The chat message cannot be empty!')
      })
      it('Test wrong response', async () => {
        const resp = {
          status: 400,
          data: ''
        }
        const getter = store.getters.get_chat_log_for_room(state, null, null, null)
        mockedAxios.put.mockImplementation(() => Promise.resolve(resp))
        await expect(() => action({
          state,
          commit: jest.fn(),
          dispatch: jest.fn(),
          getters: getter,
          rootGetters: rootGetters
        }, {
          room_id: room_id,
          message: 'string'
        })).rejects.toThrow((resp.data as unknown as MatrixError).error)
      })
    })
  })
})
