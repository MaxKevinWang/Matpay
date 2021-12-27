<template>
  <div class="card  text-center" v-if="tx !== undefined">
    <div class="card-header">
      <h3>Details</h3>
    </div>
    <div class="card-body">
      <p>{{ tx.description }}: {{ sum_amount(tx) / 100 }}€ from {{ tx.from.displayname }} at {{ tx.timestamp.toLocaleDateString() }}</p>
    </div>
    <div class="card-body" v-for="simple_transaction in tx?.txs" :key="simple_transaction.tx_id">
      <p>{{ simple_transaction.to.displayname }} owes {{ simple_transaction.amount / 100 }}€</p>
    </div>
    <div class="card-body">
      <button class="btn btn-primary" type="button" @click="modification_click()">Modify</button>
    </div>
    <ModificationDialog ref="create_dialog" :tx="tx"/>
  </div>
</template>

<script lang="ts">
import { GroupedTransaction } from '@/models/transaction.model'
import { defineComponent, PropType } from 'vue'
import ModificationDialog from '@/dialogs/ModificationDialog.vue'
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
    ModificationDialog
  },
  methods: {
    modification_click () {
      this.$refs.create_dialog.show()
    }
  }
})
</script>
<style scoped>

</style>
