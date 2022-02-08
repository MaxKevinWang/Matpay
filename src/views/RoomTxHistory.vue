<template>
  <div class="container TxWindowView">
    <div class="alert alert-danger" role="alert" v-if="error !== ''">
      {{ error }}
    </div>
    <div class="alert alert-info" id="tx-not-exist-hint" role="alert"
         v-if="this.is_tx_fully_loaded && this.tx_list.length === 0">
      No transaction exists.
    </div>
    <div class="row">
      <button v-if="!is_tx_fully_loaded" class="btn btn-primary spinner" type="button" disabled>
        <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading further messages...
        <br>
        Transaction data won't be available before all messages are downloaded.
      </button>
    </div>
    <div class="row" v-if="this.is_tx_fully_loaded">
      <h4 id="history_room_name">History: {{ room_name }}</h4>
      <div v-if="balance >= 0" id="balance-display-positive">
        <p>You owe in total: {{ to_currency_display(balance) }}</p>
      </div>
      <div v-if="balance < 0" id="balance-display-negative">
        <p>Oweing you in total: {{ to_currency_display(-balance) }} </p>
      </div>
      <div class="col-4" v-if="tx_list.length >= 1">
        <TxList :tx_list="tx_list" @on-click="on_click"/>
      </div>
      <div class="col-8" v-if="show_detail === true">
        <TxDetail :tx="tx" :room_id="room_id" @on-error="on_error"/>
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
import { validate } from 'uuid'
import router from '@/router'

export default defineComponent({
  name: 'RoomTxHistory',
  data () {
    return {
      room_name: '' as string,
      tx: {} as GroupedTransaction,
      show_detail: false as boolean,
      is_tx_fully_loaded: false,
      error: '' as string
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('rooms', [
      'get_room_name',
      'get_joined_status_for_room'
    ]),
    room_id (): string {
      return this.$route.params.room_id as string
    },
    current_group_id (): string {
      return this.$route.params.current_group_id as string
    },
    balance (): number {
      return this.get_total_open_balance_for_user_for_room(this.room_id, this.user_id)
    },
    tx_list () : Array<GroupedTransaction> {
      if (this.room_id && this.is_tx_fully_loaded) {
        return this.get_grouped_transactions_for_room(this.room_id)
      } else {
        return []
      }
    },
    ...mapGetters('tx', [
      'get_grouped_transactions_for_room',
      'get_total_open_balance_for_user_for_room'
    ])
  },
  components: { TxList, TxDetail },
  methods: {
    ...mapActions('sync', [
      'action_sync_initial_state',
      'action_sync_full_tx_events_for_room'
    ]),
    on_click (tx: GroupedTransaction) {
      if (JSON.stringify(this.tx) === JSON.stringify(tx) && this.show_detail) {
        this.show_detail = false
      } else {
        this.tx = tx
        this.show_detail = true
      }
    },
    on_error (e: string) {
      this.error = e
    }
  },
  async created () {
    await this.action_sync_initial_state()
    if (!this.get_joined_status_for_room(this.room_id)) {
      this.$router.push({
        name: 'rooms',
        query: {
          not_joined: 1
        }
      })
    }
    console.log('Checkpoint 1')
    this.action_sync_full_tx_events_for_room({
      room_id: this.room_id
    }).then(() => {
      this.error = ''
      this.room_name = this.get_room_name(this.room_id)
      this.is_tx_fully_loaded = true
    })
  },
  watch: {
    tx_list: {
      handler () {
        if (validate(this.current_group_id)) {
          const filter_txs = this.tx_list.filter(i => i.group_id === this.current_group_id)
          if (filter_txs.length > 0) {
            this.tx = filter_txs[0]
            this.show_detail = true
          }
        }
      },
      immediate: true
    }
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
