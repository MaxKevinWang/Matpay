<template>
  <div class="modal fade" :id="'DetailDialog-modal_' + this.reference.grouped_tx.group_id" tabindex="-1" aria-labelledby="DetailDialog-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="'DetailDialog-modal_' + this.reference.grouped_tx.group_id">Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide()"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-2">
              <i class="bi bi-receipt" size="5"></i>
            </div>
            <div class="col-4">
              <p>{{this.reference.grouped_tx.description}}</p>
              <p>{{to_currency_display(sum_amount(this.reference.grouped_tx))}}</p>
            </div>
            <div class="col-6">
              <p>{{"From " + this.reference.grouped_tx.from.displayname + " at " + this.reference.timestamp.toLocaleDateString()}}</p>
            </div>
          </div>
          <hr class="solid">
          <div v-for="simple_tx in reference.grouped_tx.txs" :key="simple_tx.tx_id" :data-test="simple_tx.tx_id" class="list-tab">
            <div class="row">
              <div class="col-8">
                <p>{{ simple_tx.to.displayname + ' owe ' + to_currency_display(simple_tx.amount) }}</p>
              </div>
              <div class="col-2">
                <p>{{(split_percentage(this.reference.grouped_tx)[simple_tx.tx_id] * 100).toFixed(2) + "%"}}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="on_history_click()">View in History</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { mapGetters } from 'vuex'
import { Modal } from 'bootstrap'
import { TxApprovedPlaceholder } from '@/models/chat.model'

export default defineComponent({
  name: 'DetailDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    reference: {
      type: Object as PropType<TxApprovedPlaceholder>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ])
  },
  methods: {
    show () {
      this.modal_control?.show()
      this.is_shown = true
    },
    hide () {
      this.modal_control?.hide()
      this.is_shown = false
    },
    on_history_click () {
      this.$router.push({
        name: 'room_history',
        params: {
          room_id: this.room_id,
          current_group_id: this.reference?.grouped_tx.group_id
        }
      })
      this.hide()
    }
  },
  mounted () {
    const id = 'DetailDialog-modal_' + this.reference?.grouped_tx.group_id
    this.modal_control = new Modal(document.getElementById(id) as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>

</style>
