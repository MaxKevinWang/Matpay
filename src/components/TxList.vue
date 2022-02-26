<template>
  <div class="list-group list-tab" role="tablist" v-for="tx in tx_list" :key="tx.group_id" :data-test="tx.group_id">
    <button type="button"
            class="list-group-item list-group-item-action btn btn-primary text-wrap text-break"
            :data-bs-dismiss="this.width < 768 ? 'offcanvas' : ''"
            @click="on_click_event(tx)">{{ tx.timestamp.toLocaleDateString() }} {{ tx.description }}: {{ tx.from.displayname }} paid {{ sum_amount(tx) / 100 }}€</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { GroupedTransaction } from '@/models/transaction.model'

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
    },
    width: {
      type: Number as PropType<number>
    }
  },
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    on_click_event (tx: GroupedTransaction) {
      this.$emit('on-click', tx)
    }
  }
})
</script>
<style scoped>

</style>
