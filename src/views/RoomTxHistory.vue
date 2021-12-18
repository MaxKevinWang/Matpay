<template>
  <div class="LeftHxView">
    <h3>{{ room_name }}</h3>
    <h3>Your balance: </h3>
    <div class="row" v-if="grouped_transactions.size >= 1">
      <TxList></TxList>
    </div>
  </div>
</template>

<script lang="ts">
import { GroupedTransaction } from '@/models/transaction.model'
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import TxList from '@/components/TxList.vue'
import TxDetail from '@/components/TxDetail.vue'

export default defineComponent({
  name: 'RoomTxHistory',
  data () {
    return {
      room_name: '' as string,
      from: '' as string,
      amount: 0 as number,
      tx_list: [] as Array<GroupedTransaction>,
      time: '' as string
    }
  },
  computed: {
    ...mapGetters('rooms', [
      'get_room_name'
    ]),
    room_id (): string {
      return this.$route.params.room_id as string
    },
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room'
    ])
  },
  components: {
    TxList,
    TxDetail
  },
  methods: {
    set_up () {
      this.room_name = this.get_room_name(this.room_id)
      this.tx_list = this.get_grouped_transactions_for_room(this.room_id)
    },
    make_tx_list (grouped_transaction: GroupedTransaction) {
      this.from = grouped_transaction.from.displayname
      this.time = grouped_transaction.timestamp.getDay + ' ' + this.tx_list[0].timestamp.getMonth
    },
    calc_amount (grouped_transaction: GroupedTransaction) {
      grouped_transaction.txs.forEach(txs => {
        this.amount += txs.amount
      })
      return this.amount
    }
  }
})
</script>
<style scoped>
.LeftHxView {
  left: 0;
  top: 0;
  padding: 20px;
  z-index: 7
}
</style>
