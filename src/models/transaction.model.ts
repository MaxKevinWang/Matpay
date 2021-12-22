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
  group_id : GroupID,
  approvals: Record<MatrixUserID, boolean>,
  from: User,
  description: string,
  timestamp: Date,
  txs: SimpleTransaction[]
}

export interface TxGraph {
  graph: Record<MatrixUserID, Array<[MatrixUserID, number]>>
}

export function sum_amount (item: GroupedTransaction | PendingApproval) : number {
  return item.txs.reduce((sum, tx) => sum + tx.amount, 0)
}
