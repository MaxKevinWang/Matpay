<template>
  <div class="modal fade" id="Split-modal" tabindex="-1" aria-labelledby="Split-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="Split-label">Split Configuration</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Input split as a percentage between 0 and 100. The sum of all splits should be 100.</p>
          <div class="input-group mb-3 form-control" v-for="simple_tx in this.simple_txs" :key="simple_tx.tx_id">
            <label class="input-group-text" for="split-perc">{{ simple_tx.to.displayname }}</label>
            <input v-model="this.modified_split[simple_tx.tx_id]" type="text" class="form-control" placeholder="Split value" aria-label="Recipient's username" aria-describedby="basic-addon2" id="split-perc">
            <span class="input-group-text" id="basic-addon2">%</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="on_save_click">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { RoomUserInfo, User } from '@/models/user.model'
import { Modal, Popover } from 'bootstrap'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'
import { SimpleTransaction } from '@/models/transaction.model'
import { MatrixUserID, TxID } from '@/models/id.model'
import { cloneDeep } from 'lodash'

export default defineComponent({
  name: 'SplitModifyDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    simple_txs: {
      type: Object as PropType<Array<SimpleTransaction>>
    },
    current_split: {
      type: Object as PropType<Record<TxID, number>>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      users: [] as Array<RoomUserInfo>,
      modified_split: {} as Record<TxID, string>
    }
  },
  computed: {
  },
  emits: ['on-save-split'],
  methods: {
    show () {
      this.modal_control?.show()
      this.is_shown = true
    },
    hide () {
      this.modal_control?.hide()
      this.is_shown = false
    },
    popover_hint (error_msg: string) {
      const popover = new Popover('#split-perc', {
        content: error_msg,
        container: 'body'
      })
      popover.show()
      setTimeout(() => popover.hide(), 4000)
    },
    on_save_click () {
      const split : Record<MatrixUserID, number> = {}
      for (const [tx_id, split_string] of Object.entries(this.modified_split)) {
        if (split_string.length === 0) {
          this.popover_hint('Every selected user must have a split ratio!')
          return
        }
        const num = Number(split_string)
        if (Number.isNaN(num)) {
          this.popover_hint('You can only input a number as the ratio!')
          return
        }
        split[tx_id] = num
      }
      if (Object.values(split).reduce((sum, i) => sum + i, 0) !== 100) {
        this.popover_hint('The sum of all splits does not equal to 100!')
        return
      }
      this.$emit('on-save-split', split)
      this.hide()
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('Split-modal') as HTMLElement, {
      backdrop: false
    })
  },
  watch: {
    current_split: {
      handler () {
        if (this.current_split) {
          for (const [tx_id, split_radio] of Object.entries(this.current_split)) {
            this.modified_split[tx_id] = split_radio.toFixed(0)
          }
        }
      },
      immediate: true
    }
  }
})
</script>
<style scoped>

</style>
