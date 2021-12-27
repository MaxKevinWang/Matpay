import * as runtimeCore from '@vue/runtime-core'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $refs: {
      [key: string]: HTMLElement|any,
    }
    sum_amount: (t: PendingApproval | GroupedTransaction) => number
    // ... more stuff
  }
}
