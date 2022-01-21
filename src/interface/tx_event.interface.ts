import { MatrixRoomEvent, MatrixRoomStateEvent } from '@/interface/rooms_event.interface'
import { GroupID, MatrixEventID, MatrixUserID, TxID } from '@/models/id.model'

export interface TxEvent extends MatrixRoomEvent {
  type: 'com.matpay.create'
      | 'com.matpay.modify'
      | 'com.matpay.approve'
      | 'com.matpay.rejected'
      | 'com.matpay.settle'
}

export interface TxMessageEvent extends TxEvent {
  type: 'com.matpay.create'
      | 'com.matpay.modify'
      | 'com.matpay.approve'
      | 'com.matpay.settle'
}

export interface TxStateEvent extends TxEvent, MatrixRoomStateEvent {
  type: 'com.matpay.rejected'
  state_key: string
}

interface EventSimpleTransaction {
  to: MatrixUserID,
  tx_id: TxID,
  amount: number
}

export interface TxCreateEvent extends TxMessageEvent {
  type: 'com.matpay.create',
  content: {
    from: MatrixUserID,
    txs: EventSimpleTransaction[],
    group_id: GroupID,
    description: string
  }
}

export interface TxModifyEvent extends TxMessageEvent {
  type: 'com.matpay.modify',
  content: {
    txs: EventSimpleTransaction[],
    group_id: GroupID,
    description: string
  }
}

export interface TxApproveEvent extends TxMessageEvent {
  type: 'com.matpay.approve',
  content: {
    event_id: MatrixEventID
  }
}

export interface TxRejectedEvent extends TxStateEvent {
  type: 'com.matpay.rejected',
  state_key: MatrixUserID,
  content: {
    events: MatrixEventID[]
  }
}

export interface TxSettleEvent extends TxMessageEvent {
  type: 'com.matpay.settle',
  content: {
    amount: number,
    user_id: MatrixUserID,
    event_id: MatrixEventID
  }
}

export const TX_EVENT_TYPES = [
  'com.matpay.create',
  'com.matpay.modify',
  'com.matpay.approve',
  'com.matpay.settle',
  'com.matpay.rejected'
]

export const TX_MESSAGE_EVENT_TYPES = [
  'com.matpay.create',
  'com.matpay.modify',
  'com.matpay.approve',
  'com.matpay.settle'
]
