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
    <h2 id="history_room_name">History: {{ room_name }}</h2>
    <div class="row" v-if="this.is_tx_fully_loaded">
      <div v-if="balance >= 0" id="balance-display-positive">
        <p>You owe in total: {{ to_currency_display(balance) }}</p>
      </div>
      <div v-if="balance < 0" id="balance-display-negative">
        <p>Oweing you in total: {{ to_currency_display(-balance) }} </p>
      </div>
    </div>
    <div class="card mb-3" v-if="width >= 768">
      <div class="card-body">
        <h5 class="card-title">Search & Filter</h5>
        <label for="tx-search" class="card-text me-1">Search transactions: </label>
        <input type="text" placeholder="Search for description" class="me-1" id="tx-search" v-model="filter_string">
        <div>
          <input type="checkbox" class="me-1" id="tx-participated-filter" v-model="only_participating">
          <label for="tx-participated-filter">Only show transactions participating</label>
        </div>
      </div>
    </div>
    <div class="position-fixed bottom-50 start-0 expand-button">
      <div class="row m-1">
        <button v-if="width < 768 && this.is_tx_fully_loaded"
                class="btn btn-secondary" type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#txlist"
                aria-controls="txlist"
                title="Expand">
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
    <div class="row" v-if="width >= 768 && this.is_tx_fully_loaded">
      <div class="col-md-4" v-if="tx_list.length >= 1">
        <TxList :tx_list="tx_list" :width="width" @on-click="on_click"/>
      </div>
      <div class="col-md-8" v-if="show_detail">
        <TxDetail :tx="tx" :room_id="room_id" @on-error="on_error"/>
      </div>
    </div>
    <div class="row" v-if="width < 768 && this.is_tx_fully_loaded">
        <div id="txlist"
             class="offcanvas offcanvas-start">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvas-label">Transactions</h5>
            <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <div class="card mb-3">
              <div class="card-body">
                <h5 class="card-title">Search & Filter</h5>
                <label for="tx-search" class="card-text me-1">Search transactions: </label>
                <input type="text" placeholder="Search for description" class="me-1" id="tx-search-mobile" v-model="filter_string">
                <div>
                  <input type="checkbox" class="me-1" id="tx-participated-filter-mobile" v-model="only_participating">
                  <label for="tx-participated-filter">Only show transactions participating</label>
                </div>
              </div>
            </div>
            <TxList :tx_list="tx_list" :width="width" @on-click="on_click"/>
          </div>
        </div>
        <div id="txdetail"
             class="col-md-12"
             v-if="show_detail">
          <TxDetail :tx="tx" :room_id="room_id" @on-error="on_error"/>
        </div>
        <div v-if="!show_detail">
          Expand sidebar to select a transaction.
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
import { Offcanvas } from 'bootstrap'

export default defineComponent({
  name: 'RoomTxHistory',
  data () {
    return {
      room_name: '' as string,
      tx: null as GroupedTransaction | null,
      show_detail: false as boolean,
      is_tx_fully_loaded: false,
      filter_string: '' as string,
      only_participating: false as boolean,
      error: '' as string,
      width: window.innerWidth as number
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
        let result : Array<GroupedTransaction> = this.get_grouped_transactions_for_room(this.room_id)
        if (this.only_participating) {
          result = result.filter(
            t => t.from.user_id === this.user_id ||
              t.txs.map(txs => txs.to.user_id).includes(this.user_id)
          )
        }
        if (this.filter_string.length > 0) {
          // case-insensitive comparison
          result = result.filter(t => t.description.toLowerCase().includes(this.filter_string.toLowerCase()))
        }
        return result
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
      if (this.tx?.group_id === tx.group_id && this.show_detail) {
        this.tx = null
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
      window.addEventListener('resize', () => {
        this.width = window.innerWidth
      })
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
    },
    only_participating: {
      handler () {
        this.tx = null
        this.show_detail = false
      },
      immediate: true
    },
    filter_string: {
      handler () {
        this.tx = null
        this.show_detail = false
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
.expand-button {
  z-index: 1000;
}
</style>
