<template>
  <div class="Container TxWindowView">
    <div class="row">
      <h4>{{ room_name }}</h4>
      <h4>Your balance: </h4>
      <div class="col-4" v-if="tx_list.length >= 1">
        <TxList :tx_list="tx_list" @on-click="on_click"/>
      </div>
      <div class="col-8" v-if="show_detail === true">
        <TxDetail :tx="tx"/>
      </div>
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
      tx_list: [] as Array<GroupedTransaction>,
      tx: {} as GroupedTransaction,
      show_detail: false as boolean
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
  components: { TxList, TxDetail },
  methods: {
    on_click (tx: GroupedTransaction) {
      if (JSON.stringify(this.tx) === JSON.stringify(tx) && this.show_detail) {
        this.show_detail = false
      } else {
        this.tx = tx
        this.show_detail = true
      }
    }
  },
  created () {
    this.room_name = this.get_room_name(this.room_id)
    this.tx_list = this.get_grouped_transactions_for_room(this.room_id)
  }
})
</script>
<style scoped>
.TxWindowView {
  left: 0;
  top: 0;
  padding: 20px;
  z-index: 7
}
</style>
