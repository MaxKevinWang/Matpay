<template>
  <div class="card" style="background-color: rgba(105, 105, 105,.5)">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <p>{{this.reference.timestamp.toLocaleDateString()}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.grouped_tx.description}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.grouped_tx.from.displayname + " paid " + to_currency_display(sum_amount(this.reference.grouped_tx))}}</p>
        </div>
        <div class="col">
         <router-link :to="{ name: 'room_history', params: {room_id: this.room_id, current_group_id: this.reference.grouped_tx.group_id}}" class="btn btn-primary">
           Details
         </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { User } from '@/models/user.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { TxApprovedPlaceholder, TxPlaceholder } from '@/models/chat.model'
export default defineComponent({
  name: 'TxApprovedMessageBox',
  props: {
    reference: {
      type: Object as PropType<TxApprovedPlaceholder>
    },
    room_id: {
      type: String as PropType<MatrixRoomID>
    }
  },
  data () {
    return {
      from: {} as User,
      amount: 0 as number,
      description: '' as string,
      timestamp: {} as Date
    }
  },
  computed: {
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room'
    ])
    //  ...mapGetters('tx', [
    //    'transaction'
    //  ])
  },
  components: {},
  methods: {
    calc_amount (tx: GroupedTransaction) : number {
      let amount = 0
      for (const simple_tx of tx.txs) {
        amount += simple_tx.amount
      }
      return amount
    },
    calc_amount2 (tx: PendingApproval) : number {
      let amount = 0
      for (const simple_tx of tx.txs) {
        amount += simple_tx.amount
      }
      return amount
    }
  }
})
</script>
<style scoped>

.card {
  position: relative;
  margin-bottom: 30px;
}

</style>
