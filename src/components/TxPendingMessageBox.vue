<template>
  <div class="card" style="background-color: rgba(255, 193, 193,.5)">
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
          <button href="#" class="btn btn-primary" @click="approval_click()">details</button>
        </div>
      </div>
    </div>
    <ApprovalDialog ref="create_dialog" :reference="reference"/>
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
import CreateRoomDialog from '@/dialogs/CreateRoomDialog.vue'
import ApprovalDialog from '@/dialogs/ApprovalDialog.vue'

export default defineComponent({
  name: 'TxPendingMessageBox',
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
    ApprovalDialog,
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
    },
    approval_click () {
      this.$refs.create_dialog.show()
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