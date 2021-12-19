<template>
  <div class="card">
    <div class="card-body">
      <h5 class="card-title"></h5>
      <p class="card-text"></p>
      <p>{{this.reference.timestamp.toLocaleDateString()}}</p>
      <p>{{this.reference.grouped_tx.description}}</p>
      <p>{{this.reference.grouped_tx.from.displayname + " paid " + this.calc_amount(this.reference.grouped_tx)+"$"}}</p>
      <a href="#" class="btn btn-primary">details</a>
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
      tx.txs.forEach(txs => {
        amount += txs.amount
      })
      return amount
    }
  }
})
</script>
<style scoped>

.card {
  position: relative;
  background: darkgrey;
  margin-bottom: 30px;
}

</style>
