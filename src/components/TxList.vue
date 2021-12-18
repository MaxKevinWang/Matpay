<template>
  <div>
    <div class="col-4">
      <div class="list-group" id="list-tab" role="tablist">
        <a class="list-group-item list-group-item-action active" id="list-home-list" data-bs-toggle="list" href="#list-home" role="tab" aria-controls="list-home" v-for="grouped_transaction in grouped_transactions" :key="grouped_transaction.timestamp">{{ time }} Description: {{ from }} paid {{ amount }}</a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
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
    }
  },
  computed: {
  },
  methods: {
  }
})
</script>
<style scoped>

</style>
