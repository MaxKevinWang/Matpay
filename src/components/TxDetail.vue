<template>
  <div class="tab-pane" id="#" role="tabpanel" aria-labelledby="list-list">
    <div class="card  text-center">
       <div class="card-header">
         <h3>Details</h3>
      </div>
      <div class="card-body" v-if="tx !== undefined">
        <p>Description: {{ calc_amount(tx) }} From {{ tx.from.displayname }} at {{ tx.timestamp.toLocaleDateString() }}</p>
      </div>
      <div class="card-body" v-for="simple_transaction in tx?.txs" :key="simple_transaction.tx_id">
        <p>{{ simple_transaction.to.displayname }} owes {{ simple_transaction.amount }}</p>
       </div>
    <div class="card">
      <div class="card-body">
        <button type="button">Modify</button>
      </div>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { GroupedTransaction } from '@/models/transaction.model'
import { defineComponent, PropType } from 'vue'
export default defineComponent({
  name: 'TxDetail',
  props: {
    tx: {
      type: Object as PropType<GroupedTransaction>
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  components: {
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
