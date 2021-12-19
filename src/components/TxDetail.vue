<template>
  <div class="col-8">
    <div class="tab-content" id="nav-tabContent">
      <div class="tab-pane" role="tabpanel">
        <div class="card text-center">
          <div class="card-header">
            <h3 style="text-align:center">Details</h3>
          </div>
          <div class="card-body">
            <p>{{ tx.timestamp.toLocaleDateString() }} Description: {{ tx.from.displayname }} paid {{ calc_amount(tx) }}</p>
          </div>
          <div class="card-footer">
            2 days ago
          </div>
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
  }
})
</script>
<style scoped>

</style>
