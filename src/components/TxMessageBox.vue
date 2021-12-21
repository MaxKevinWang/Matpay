<template>
  <div class="card" v-if="this.reference.type === 'approved'"
       :style="['background-color: rgba(105, 105, 105,.5)']">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <p>{{this.reference.timestamp.toLocaleDateString()}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.grouped_tx.description}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.grouped_tx.from.displayname + " paid " + this.calc_amount(this.reference.grouped_tx)+"$"}}</p>
        </div>
        <div class="col">
         <a href="#" class="btn btn-primary">details</a>
        </div>
      </div>
    </div>
  </div>
  <div class="card" v-if="this.reference.type === 'pending'"
       :style="['background-color: rgba(255, 193, 193,.5)']">
    <div class="card-body">
      <div class="row">
        <div class="col">
          <p>{{this.reference.timestamp.toLocaleDateString()}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.approval.description}}</p>
        </div>
        <div class="col">
          <p>{{this.reference.approval.from.displayname + " paid " + this.calc_amount2(this.reference.approval)+"$"}}</p>
        </div>
        <div class="col">
          <a href="#" class="btn btn-primary">details</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { DEFAULT_AVATAR } from '@/utils/consts'
import TxDetail from '@/components/TxDetail.vue'
import { User } from '@/models/user.model'
import { GroupID, MatrixEventID, MatrixRoomID, MatrixUserID, TxID } from '@/models/id.model'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { TxPlaceholder } from '@/models/chat.model'

export default defineComponent({
  name: 'TxMessageBox',
  props: {
    reference: {
      type: Object as PropType<TxPlaceholder>
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
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TxDetail
  },
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
