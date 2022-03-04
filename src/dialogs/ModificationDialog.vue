<template>
  <div class="modal fade" id="modification-modal" tabindex="-1" aria-labelledby="modification-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="modification-label">Modification</h5>
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
            <span id="basic-addon2" class="input-group-text">
              <i class="bi bi-currency-euro"></i>
            </span>
            <input type="text" v-model="amount_input" class="form-control" placeholder="Amount" aria-label="Amount" aria-describedby="basic-addon1" id="input-amount-modification">
          </div>
          <div>
            <button type="button" class="btn btn-primary" @click="on_split_configuration_clicked()">Split Configuration</button>
          </div>
        </div>
        <div class="modal-footer">
          <button id="modify-confirm" type="button" :disabled="disabled" class="btn btn-primary" @click="on_confirm()">Submit</button>
        </div>
      </div>
    </div>
  </div>
  <SplitModifyDialog ref="split_dialog" :room_id="room_id" :simple_txs="tx.txs" :current_split="split" @on-save-split="on_save_split"/>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { mapActions } from 'vuex'
import { Modal, Popover } from 'bootstrap'
import { RoomUserInfo } from '@/models/user.model'
import { GroupedTransaction } from '@/models/transaction.model'
import SplitModifyDialog from '@/dialogs/SplitModifyDialog.vue'
import { TxID } from '@/models/id.model'
import { cloneDeep } from 'lodash'
import Dinero from 'dinero.js'

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
      amount_input: '' as string,
      split: {} as Record<TxID, number>,
      disabled: false as boolean
    }
  },
  emits: ['on-error'],
  computed: {
  },
  components: {
    SplitModifyDialog
  },
  methods: {
    ...mapActions('tx', [
      'action_modify_tx_for_room'
    ]),
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
          content: 'Amount has to be a positive number',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
    },
    on_save_split (split: Record<TxID, number>) {
      this.split = split
    },
    async on_confirm () {
      if (this.description.length >= 1 && this.is_number()) {
        this.amount = Number(this.amount_input) * 100 // Euro to cent
        // Execute modification
        if (this.tx) {
          const tx_new = cloneDeep(this.tx)
          tx_new.description = this.description
          // Resplit
          // This only works assuming JavaScript preserves deterministic object ordering!
          const dinero_ratio = Object.values(this.split)
          const split_result = Dinero({ amount: this.amount }).allocate(dinero_ratio)
          for (const [index, tx_id] of Object.keys(this.split).entries()) {
            tx_new.txs.filter(i => i.tx_id === tx_id)[0].amount = split_result[index].getAmount()
          }
          try {
            this.disabled = true
            await this.action_modify_tx_for_room({
              room_id: this.room_id,
              tx_old: this.tx,
              tx_new: tx_new
            })
            this.disabled = false
            this.$router.push({
              name: 'room_detail',
              params: {
                room_id: this.room_id
              }
            })
            this.amount_input = ''
            this.description = ''
            this.hide()
          } catch (e) {
            this.$emit('on-error', e)
            this.disabled = false
          }
        }
      } else {
        this.disabled = false
        this.popover_hint(this.description.length >= 1)
        this.popover_no_number(this.is_number())
      }
    },
    on_split_configuration_clicked () {
      this.$refs.split_dialog.show()
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('modification-modal') as HTMLElement, {
      backdrop: false
    })
  },
  unmounted () {
    this.hide()
  },
  watch: {
    tx: {
      handler () {
        if (this.tx) {
          this.description = this.tx?.description
          this.amount = this.sum_amount(this.tx) / 100
          this.amount_input = this.amount.toString()
          // calculate split here
          const split = this.split_percentage(this.tx.txs)
          this.split = (function () {
            const split_string : Record<TxID, number> = {}
            for (const [tx_id, split_number] of Object.entries(split)) {
              split_string[tx_id] = (split_number * 100)
            }
            return split_string
          }())
        }
      },
      immediate: true
    }
  }
})
</script>
<style scoped>

</style>
