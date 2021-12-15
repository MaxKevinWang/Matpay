import { User } from '@/models/user.model'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'

export interface ChatMessage {
  sender: User,
  content: string,
  timestamp: Date
}

export interface TxApprovedPlaceholder {
  type: 'approved',
  grouped_tx: GroupedTransaction,
}

export interface TxPendingPlaceholder {
  type: 'pending',
  approval: PendingApproval
}

export type TxPlaceholder = TxApprovedPlaceholder | TxPendingPlaceholder

export interface ChatLog {
  messages: Array<ChatMessage | TxPlaceholder>
}
