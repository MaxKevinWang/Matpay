<template>
  <div class="modal fade" :id="'ApprovalDialog-modal_' + this.reference.approval.group_id" tabindex="-1" aria-labelledby="ApprovalDialog-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" :id="'ApprovalDialog-modal_' + this.reference.approval.group_id">Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide()"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-2">
              <i class="bi bi-receipt" size="5"></i>
            </div>
            <div class="col-4">
              <p>{{this.reference.approval.description}}</p>
              <p>{{to_currency_display(sum_amount(this.reference.approval))}}</p>
            </div>
            <div class="col-6">
              <p>{{"From " + this.reference.approval.from.displayname + " at " + this.reference.timestamp.toLocaleDateString()}}</p>
            </div>
          </div>
          <hr class="solid">
          <div v-for="simple_tx in reference.approval.txs" :key="simple_tx.tx_id">
            <div class="row">
              <div class="col-2">
                <div v-if="reference.approval.approvals[simple_tx.to.user_id]">
                <i class="bi bi-person-check-fill" data-bs-toggle="tooltip" data-bs-placement="top" title="Approved"></i>
                </div>
                <div v-else>
                  <i class="bi bi-person-dash" data-bs-toggle="tooltip" data-bs-placement="top" title="Not Approved"></i>
                </div>
              </div>
              <div class="col-8" id="detailed-tx">
                <p>{{ simple_tx.to.displayname + ' owe ' + to_currency_display(simple_tx.amount) }}</p>
              </div>
              <div class="col-2" id="split-percentage">
                <p>{{(split_percentage(this.reference.approval)[simple_tx.tx_id] * 100).toFixed(2) + "%"}}</p>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-2">
              <div v-if="reference.approval.approvals[reference.approval.from.user_id]">
                <i class="bi bi-person-check-fill" data-bs-toggle="tooltip" data-bs-placement="top" title="Approved"></i>
              </div>
              <div v-else>
                <i class="bi bi-person-dash" data-bs-toggle="tooltip" data-bs-placement="top" title="Not Approved"></i>
              </div>
            </div>
            <div class="col-10">
              <p>{{'From ' + reference.approval.from.displayname}}</p>
            </div>
          </div>
        </div>
        <div class="row" v-if="reference.approval.approvals[this.user_id]">
          <div class="col-2" />
          <div class="col-10"><p>You have already approved this transaction.</p></div>
        </div>
        <div class="modal-footer" v-if="!reference.approval.approvals[this.user_id] && is_current_user_participant">
          <button data-cy="reject" type="button" class="btn btn-danger" @click="on_reject_click()">Reject</button>
          <button data-cy="approve" type="button" class="btn btn-primary" @click="on_approve_click()">Approve</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Modal, Popover } from 'bootstrap'
import { TxPendingPlaceholder, TxPlaceholder } from '@/models/chat.model'
import { PendingApproval } from '@/models/transaction.model'

export default defineComponent({
  name: 'ApprovalDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    reference: {
      type: Object as PropType<TxPendingPlaceholder>
    }
  },
  emits: ['on-approval', 'on-reject'],
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    is_current_user_participant () {
      return this.reference?.approval.from.user_id === this.user_id ||
        (this.reference?.approval.txs.map(u => u.to.user_id).includes(this.user_id))
    }
  },
  components: {
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
    on_approve_click () {
      this.$emit('on-approval', this.reference?.approval)
    },
    on_reject_click () {
      this.$emit('on-reject', this.reference?.approval)
    }
  },
  mounted () {
    const id = 'ApprovalDialog-modal_' + this.reference?.approval.group_id
    this.modal_control = new Modal(document.getElementById(id) as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>

</style>
