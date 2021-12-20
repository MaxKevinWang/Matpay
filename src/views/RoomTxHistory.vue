<template>
  <div class="LeftHxView">
    <h3>{{ room_name }}</h3>
    <h3>Your balance: </h3>
    <div class="row" v-if="tx_list.length >= 1">
      <div class="col-4">
        <TxList :tx_list="tx_list" @on-click="on_click"/>
      </div>
      <div class="col-8">
        <div class="tab-content" id="nav-tabContent">
         <TxDetail :tx="tx"/>
        </div>
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
      tx: {} as GroupedTransaction
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
      this.tx = tx
    }
  },
  created () {
    this.room_name = this.get_room_name(this.room_id)
    this.tx_list = this.get_grouped_transactions_for_room(this.room_id)
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
