<template>
  <div class="modal fade" id="create-tx-modal" tabindex="-1" aria-labelledby="create-tx-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="create-tx-label">Create Transaction</h5>
          <button type="button" data-bs-dismiss="modal" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="modal-body d-grid gap-2">
          <div class="alert alert-danger" role="alert" v-if="this.error">
            {{ this.error }}
          </div>
          <div class="input-group">
            <span id="basic-addon1" class="input-group-text">
              <i class="bi bi-receipt"></i>
            </span>
            <input v-model="description" type="text" class="form-control" placeholder="Description"
                   aria-label="Description" aria-describedby="basic-addon1" data-bs-toggle="popover"
                   id="input-description">
          </div>
          <div class="input-group">
            <span id="basic-addon2" class="input-group-text">
              <i class="bi bi-currency-euro"></i>
            </span>
            <input v-model="amount_input" type="text" class="form-control" placeholder="Amount" aria-label="Amount"
                   aria-describedby="basic-addon1" data-bs-toggle="popover" id="input-amount">
          </div>
          <div id="v-model-select-dynamic">
            <select class="form-select" v-model="selected_from" id="select-member">
              <option disabled value="">Choose the payer</option>
              <option v-for="user in room_members" :key="user.user.user_id" :value="user.user.user_id">
                {{ user.user.displayname }}
              </option>
            </select>
          </div>
          <button class="btn btn-primary" id="split_button" @click="on_split_configuration_clicked()">Split Configuration</button>
        </div>
        <div class="modal-footer">
          <p>Date: {{ new Date().toLocaleDateString() }}</p>
          <button id="create-confirm" type="button" class="btn btn-primary" @click="on_confirm()">Confirm</button>
        </div>
      </div>
    </div>
  </div>
  <SplitCreateDialog ref="split_dialog" :room_id="room_id" :users_info="users_info" :current_split="split"
                     @on-save-split="on_save_split"/>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { RoomUserInfo } from '@/models/user.model'
import { Modal, Popover } from 'bootstrap'
import SplitCreateDialog from '@/dialogs/SplitCreateDialog.vue'
import { MatrixUserID } from '@/models/id.model'
import { GroupedTransaction, SimpleTransaction } from '@/models/transaction.model'
import Dinero from 'dinero.js'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'CreateTxDialog',
  props: {
    room_id: {
      type: String as PropType<string>
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
      amount_input: '' as string,
      room_members: [] as Array<RoomUserInfo>,
      selected_from: '' as string,
      split: {} as Record<MatrixUserID, number>,
      error: null as string | null
    }
  },
  computed: {},
  components: {
    SplitCreateDialog
  },
  methods: {
    ...mapActions('tx', [
      'action_create_tx_for_room'
    ]),
    show () {
      this.modal_control?.show()
      this.is_shown = true
    },
    hide () {
      this.modal_control?.hide()
      this.is_shown = false
    },
    on_split_configuration_clicked () {
      this.$refs.split_dialog.show()
    },
    popover_hint (description: boolean, number: boolean, selected: boolean, split: boolean) {
      if (!description) {
        const popover = new Popover('#input-description', {
          content: 'Description cannot be empty',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
      if (!number) {
        const popover = new Popover('#input-amount', {
          content: 'Amount has to be a positive number',
          container: 'body'
        })
        this.amount_input = ''
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
      if (!selected) {
        const popover = new Popover('#select-member', {
          content: 'You have to select a payer!',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
      if (!split) {
        const popover = new Popover('#split_button', {
          content: 'You have to specify a split!',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
    },
    async on_confirm () {
      if (this.description.length >= 1 &&
        this.is_number() &&
        this.selected_from !== '' &&
        Object.keys(this.split).length > 0) {
        const amount = Number(this.amount_input) * 100 // Euro to cent
        // prepare transaction creation
        try {
          const from_user = this.room_members.filter(i => i.user.user_id === this.selected_from)[0].user
          const txs : SimpleTransaction[] = []
          // Split the actual total amount
          // This only works assuming JavaScript preserves deterministic object ordering!
          const dinero_ratio = Object.values(this.split)
          const split_result = Dinero({ amount: amount }).allocate(dinero_ratio)
          for (const [index, to_user_id] of Object.keys(this.split).entries()) {
            txs.push({
              to: this.room_members.filter(i => i.user.user_id === to_user_id)[0].user,
              amount: split_result[index].getAmount(),
              tx_id: ''
            })
          }
          const new_tx: GroupedTransaction = {
            from: from_user,
            txs: txs,
            description: this.description,
            group_id: '',
            pending_approvals: [],
            state: 'defined',
            timestamp: new Date()
          }
          await this.action_create_tx_for_room({
            room_id: this.room_id,
            tx: new_tx
          })
          // clear dialog
          this.amount_input = ''
          this.description = ''
          this.selected_from = ''
          this.split = {}
          this.error = null
          this.hide()
        } catch (e: unknown) {
          this.error = (e as Error).toString()
        }
      } else {
        this.popover_hint(this.description.length >= 1,
          this.is_number(),
          this.selected_from !== '',
          Object.keys(this.split).length > 0)
      }
    },
    on_save_split (split: Record<MatrixUserID, number>) {
      this.split = split
    },
    is_number (): boolean {
      let check_amount = this.amount_input
      if (check_amount.includes(',')) {
        check_amount = check_amount.replace(',', '.')
      }
      // if it´s not a number it returns false
      if (Number.isNaN(Number(check_amount)) || check_amount === '' || check_amount.startsWith('-')) {
        return false
      } else {
        return true
      }
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('create-tx-modal') as HTMLElement, {
      backdrop: false
    })
  },
  watch: {
    users_info: {
      handler () {
        if (this.users_info) {
          this.room_members = this.users_info
        }
      },
      immediate: true
    }
  }
})
</script>
<style scoped>

</style>
