import { User } from '@/models/user.model'
import { GroupID, MatrixEventID, MatrixUserID, TxID } from '@/models/id.model'

export interface SimpleTransaction {
  to: User,
  tx_id: TxID,
  amount: number
}

export interface GroupedTransaction {
  from: User,
  group_id: GroupID,
  state: 'defined' | 'approved' | 'frozen' | 'settlement',
  txs: SimpleTransaction[],
  description: string,
  participants?: User[]
  timestamp: Date,
  pending_approvals: PendingApproval[]
}

export interface PendingApproval {
  event_id: MatrixEventID,
  type: 'create' | 'modify',
  grouped_tx? : GroupedTransaction, // if exists then modification, if doesn't then creation
  approvals: Record<MatrixUserID, boolean>,
  description: string,
  timestamp: Date,
  txs: SimpleTransaction[]
}

export interface TxGraph {
  graph: Record<MatrixUserID, Array<[MatrixUserID, number]>>
}
