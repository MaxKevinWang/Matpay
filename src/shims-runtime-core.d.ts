import * as runtimeCore from '@vue/runtime-core'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { TxID } from '@/models/id.model'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $refs: {
      [key: string]: HTMLElement|any,
    }
    sum_amount: (t: PendingApproval | GroupedTransaction | SimpleTransaction[]) => number,
    split_percentage: (t: GroupedTransaction | PendingApproval | SimpleTransaction[]) => Record<TxID, number>
    to_currency_display: (num: number) => string
    // ... more stuff
  }
}
