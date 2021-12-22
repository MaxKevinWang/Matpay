<template>
  <div class="modal fade" id="<...>-modal" tabindex="-1" aria-labelledby="<...>-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="<...>-label">Details</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide()"></button>
        </div>
        <div class="modal-body">
          <div class="row">
            <div class="col-2">
              <p>Place for Icon</p>
            </div>
            <div class="col-4">
              <p>{{this.reference.approval.description}}</p>
              <p>{{sum_amount(this.reference.approval) + "€" }}</p>
            </div>
            <div class="col-6">
              <p>{{"From" + this.reference.approval.from.displayname + "at" + this.reference.timestamp.getDay()}}</p>
              <p>{{this.reference.timestamp.getMonth() + " " + this.reference.timestamp.getFullYear()}}</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Reject</button>
          <button type="button" class="btn btn-primary">Approve</button>
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
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean
    }
  },
  computed: {
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
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('<...>-modal') as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>

</style>
