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
          <div class="input-group mb-3 form-control" v-for="user in users" :key="user.user.user_id" :data-test="user.user.user_id">
                   <span class="input-group-text" id="basic-addon3">
              <input class="form-check-input" type="checkbox" :id="`split-checkbox${selectorify(user.user.user_id)}`" :value="user.user.user_id" v-model="selected_members" >
            </span>
            <label class="input-group-text" :for="`split-perc${selectorify(user.user.user_id)}`">{{ user.displayname }}</label>
            <input
              v-model="this.selected_members_split[user.user.user_id]"
              type="text"
              class="form-control"
              placeholder="Split value"
              aria-label="Recipient's username"
              aria-describedby="basic-addon2"
              :id="`split-perc${selectorify(user.user.user_id)}`"
              :disabled="!this.selected_members.includes(user.user.user_id)"
            >
            <span class="input-group-text" id="basic-addon2">%</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-info" @click="on_default_split" id="default-split">Split Equally among Selected</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="on_save_click" id="split_create_save">Save</button>
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
import { MatrixUserID } from '@/models/id.model'
import Dinero from 'dinero.js'

export default defineComponent({
  name: 'SplitCreateDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    users_info: {
      type: Object as PropType<Array<RoomUserInfo>>
    },
    simple_txs: {
      type: Object as PropType<Array<SimpleTransaction>>
    },
    current_split: {
      type: Object as PropType<Record<MatrixUserID, number>>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      users: [] as Array<RoomUserInfo>,
      selected_members: [] as Array<MatrixUserID>,
      selected_members_split: {} as Record<MatrixUserID, string>
    }
  },
  emits: ['on-save-split'],
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
    },
    popover_hint (error_msg: string, user_id?: MatrixUserID) {
      if (user_id) {
        console.log(`#split-perc${this.selectorify(user_id)}`)
      }
      const popover = new Popover(user_id ? `#split-perc${this.selectorify(user_id)}` : '#basic-addon3', {
        content: error_msg,
        container: 'body'
      })
      popover.show()
      setTimeout(() => popover.hide(), 4000)
    },
    on_save_click () {
      if (this.selected_members.length <= 0) {
        this.popover_hint('You must select at least one user!')
        return
      }
      const split : Record<MatrixUserID, number> = {}
      for (const selected of this.selected_members) {
        if (!this.selected_members_split[selected]) {
          this.popover_hint('Every selected user must have a split ratio!', selected)
          return
        }
        const num = Number(this.selected_members_split[selected])
        if (Number.isNaN(num)) {
          this.popover_hint('You can only input a number as the ratio!', selected)
          return
        }
        split[selected] = num
      }
      if (Object.values(split).reduce((sum, i) => sum + i, 0) !== 100) {
        this.popover_hint('The sum of all splits does not equal to 100!', this.selected_members[0])
        return
      }
      this.$emit('on-save-split', split)
      this.hide()
    },
    on_default_split () {
      if (this.selected_members.length >= 1) {
        const ones = new Array(this.selected_members.length).fill(1)
        const dinero_allocate = Dinero({ amount: 100 }).allocate(ones)
        for (let index = 0; index < this.selected_members.length; index++) {
          const selected = this.selected_members[index]
          this.selected_members_split[selected] = dinero_allocate[index].getAmount().toString()
        }
      }
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('Split-modal') as HTMLElement, {
      backdrop: false
    })
  },
  watch: {
    users_info: {
      handler () {
        if (this.users_info) {
          this.users = this.users_info
        }
      },
      immediate: true
    },
    current_split: {
      handler () {
        if (this.current_split) {
          for (const [user_id, split_radio] of Object.entries(this.current_split)) {
            this.selected_members.push(user_id)
            this.selected_members_split[user_id] = split_radio.toString()
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
