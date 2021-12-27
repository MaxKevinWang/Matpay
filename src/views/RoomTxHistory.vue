<template>
  <div class="container TxWindowView">
    <div class="row">
      <button v-if="!is_fully_loaded" class="btn btn-primary spinner" type="button" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading further messages...
        <br>
        Transaction data won't be available before all messages are downloaded.
      </button>
    </div>
    <div class="row" v-if="this.is_fully_loaded">
      <h4>History: {{ room_name }}</h4>
      <h6>Your balance: </h6>
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
      show_detail: false as boolean,
      is_fully_loaded: false
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
    ...mapActions('sync', [
      'action_sync_initial_state',
      'action_sync_full_events_for_room'
    ]),
    on_click (tx: GroupedTransaction) {
      if (JSON.stringify(this.tx) === JSON.stringify(tx) && this.show_detail) {
        this.show_detail = false
      } else {
        this.tx = tx
        this.show_detail = true
      }
    }
  },
  async created () {
    await this.action_sync_initial_state()
    this.action_sync_full_events_for_room({
      room_id: this.room_id,
      tx_only: false
    }).then(() => {
      this.room_name = this.get_room_name(this.room_id)
      this.tx_list = this.get_grouped_transactions_for_room(this.room_id)
      this.is_fully_loaded = true
    })
  }
})
</script>
<style scoped>
.TxWindowView {
  left: 0;
  top: 0;
  padding: 20px;
}
</style>
