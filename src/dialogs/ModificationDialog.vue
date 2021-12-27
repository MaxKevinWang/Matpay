<template>
  <div class="modal fade" id="<...>-modal" tabindex="-1" aria-labelledby="<...>-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="<...>-label">Modification</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="hide()"></button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <span id="basic-addon1" class="input-group-text">
              <i class="bi bi-receipt"></i>
            </span>
            <input type="text" v-model="description" class="form-control" placeholder="Description" aria-label="Description" aria-describedby="basic-addon1" id="input-description-modification">
          </div>
          <div class="input-group">
            <span id="basic-addon1" class="input-group-text">
              <i class="bi bi-currency-euro"></i>
            </span>
            <input type="text" v-model="amount_input" class="form-control" placeholder="Amount" aria-label="Amount" aria-describedby="basic-addon1" id="input-amount-modification">
          </div>
          <div>
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="on_split_configuration_clicked()">Split Configuration</button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="on_confirm()">Submit</button>
        </div>
      </div>
    </div>
  </div>
  <SplitDialog ref="split_dialog" :room_id="room_id" :users_info="users_info" />
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Modal, Popover } from 'bootstrap'
import { TxApprovedPlaceholder } from '@/models/chat.model'
import { RoomUserInfo } from '@/models/user.model'
import { GroupedTransaction, PendingApproval } from '@/models/transaction.model'
import SplitDialog from '@/dialogs/SplitDialog.vue'

export default defineComponent({
  name: 'ModificationDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    tx: {
      type: Object as PropType<GroupedTransaction>
    },
    users_info: {
      type: Object as PropType<Array<RoomUserInfo>>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      description: '' as string,
      amount: 0 as number,
      amount_input: '' as string
    }
  },
  computed: {
  },
  components: {
    SplitDialog
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
    popover_hint (description : boolean) {
      if (!description) {
        const popover = new Popover('#input-description-modification', {
          content: 'Description cannot be empty',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
    },
    is_number () : boolean {
      let check_amount = this.amount_input
      if (check_amount.includes(',')) {
        check_amount = check_amount.replace(',', '.')
      }
      /*
       if it´s not a number it returns false
      */
      if (isNaN(Number(check_amount))) {
        return false
      } else {
        if (check_amount.charAt(0) === '-') {
          return false
        }
        return true
      }
    },
    popover_no_number (number: boolean) {
      if (!number) {
        const popover = new Popover('#input-amount-modification', {
          content: 'Amount has to be a number',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
    },
    on_confirm () {
      if (this.description.length >= 1 && this.is_number()) {
        this.amount = parseFloat(this.amount_input)
        this.amount_input = ''
        this.description = ''
        this.hide()
      } else {
        this.popover_hint(this.description.length >= 1)
        this.popover_no_number(this.is_number())
      }
    },
    on_split_configuration_clicked () {
      this.$refs.split_dialog.show()
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('<...>-modal') as HTMLElement, {
      backdrop: false
    })
  },
  watch: {
    reference: {
      handler () {
        if (this.tx) {
          this.description = this.tx?.description
          this.amount = this.sum_amount(this.tx) / 100
          this.amount_input = this.amount.toString()
        }
      },
      immediate: true
    }
  }
})
</script>
<style scoped>

</style>
