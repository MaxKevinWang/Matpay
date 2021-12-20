<template>
  <div class="list-group" id="list-tab" role="tablist" v-for="tx in tx_list" :key="tx.timestamp.toLocaleDateString()">
    <a class="list-group-item list-group-item-action" data-bs-toggle="list"  href="#" role="tab" aria-controls="list" @click="on_click_event(tx)">{{ tx.timestamp.toLocaleDateString() }} Description: {{ tx.from.displayname }} paid {{ calc_amount(tx) }}</a>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { GroupedTransaction } from '@/models/transaction.model'
import { GroupID } from '@/models/id.model'

export default defineComponent({
  name: 'TxList',
  emits: {
    'on-click': (tx: GroupedTransaction) => {
      return tx
    }
  },
  props: {
    tx_list: {
      type: Object as PropType<Array<GroupedTransaction>>
    }
  },
  data () {
    return {
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
    },
    on_click_event (tx: GroupedTransaction) {
      this.$emit('on-click', tx)
    }
  }
})
</script>
<style scoped>

</style>
