<template>
  <div class="list-group" id="list-tab" role="tablist" v-for="tx in tx_list" :key="tx.timestamp.toLocaleDateString()">
    <div>
      <a class="list-group-item list-group-item-action" data-bs-toggle="list">{{ tx.timestamp.toLocaleDateString() }} Description: {{ tx.from.displayname }} paid {{ calc_amount(tx) }}</a>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { GroupedTransaction } from '@/models/transaction.model'

export default defineComponent({
  name: 'TxList',
  props: {
    tx_list: {
      type: Object as PropType<Array<GroupedTransaction>>
    }
  },
  data () {
    return {
      amount: 0 as number
    }
  },
  computed: {
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

</style>
