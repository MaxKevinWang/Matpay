<template>
  <div class="LeftHxView">
    <h3>{{ room_name }}</h3>
    <h3>Your balance: </h3>
    <div class="row" v-if="tx_list.length >= 1">
      <div class="col-4">
        <TxList :tx_list="tx_list" @on-click="on_click"/>
      </div>
      <b-modal ref="show_detail">
        <div class="col-8" v-if="show_detail === true">
          <div class="tab-content" id="nav-tabContent">
            <TxDetail :tx="tx"/>
          </div>
        </div>
      </b-modal>
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
    ...mapActions('tx', [
      'action_create_mock_tx'
    ]),
    ...mapActions('chat', [
      'action_create_mock_chat'
    ]),
    on_click (tx: GroupedTransaction) {
      this.tx = tx
      this.show_detail = true
      this.$refs.show_detail.show()
    }
  },
  async created () {
    this.room_name = this.get_room_name(this.room_id)
    this.tx_list = this.get_grouped_transactions_for_room(this.room_id)
    await this.action_create_mock_tx({
      room_id: this.room_id
    })
    await this.action_create_mock_chat({
      room_id: this.room_id
    })
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
