<template>
  <div class="modal fade" id="create-tx-modal" tabindex="-1" aria-labelledby="create-tx-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="create-tx-label"> {{ room_name }} </h5>
          <button type="button" data-bs-dismiss="modal" class="btn-close" aria-label="Close"></button>
        </div>
        <div class="modal-body d-grid gap-2">
          <div class="input-group">
            <span id="basic-addon1" class="input-group-text">
              <i class="bi bi-receipt"></i>
            </span>
            <input v-model="description" type="text" class="form-control" placeholder="Description" aria-label="Description" aria-describedby="basic-addon1" data-bs-toggle="popover" id="input-description">
          </div>
          <div class="input-group">
            <span id="basic-addon2" class="input-group-text">
              <i class="bi bi-currency-euro"></i>
            </span>
            <input v-model="amount_input" type="text" class="form-control" placeholder="Amount" aria-label="Amount" aria-describedby="basic-addon1" data-bs-toggle="popover" id="input-amount">
          </div>
          <div id="v-model-select-dynamic">
            <select v-model="selected">
              <option disabled value="">Choose the payer</option>
              <option v-for="user in room_members" :key="user.user.user_id">
                {{ user.user.displayname }}
              </option>
            </select>
          </div>
          <button class="btn btn-primary" @click="on_split_configuration_clicked()">Split Configuration</button>
        </div>
        <div class="modal-footer">
          <p>Date: {{ new Date().toLocaleDateString() }}</p>
          <button type="button" class="btn btn-primary" @click="on_confirm()">Confirm</button>
        </div>
      </div>
    </div>
  </div>
  <SplitDialog ref="split_dialog" :room_id="room_id" :users_info="users_info"/>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import SplitDialog from '@/dialogs/SplitDialog.vue'
import { defineComponent, PropType } from 'vue'
import { RoomUserInfo } from '@/models/user.model'
import { mapActions, mapGetters } from 'vuex'
import { Modal, Popover } from 'bootstrap'

export default defineComponent({
  name: 'CreateTxDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    room_name: {
      type: Number as PropType<number>
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
      selected: '' as string,
      amount: 0 as number
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
    on_split_configuration_clicked () {
      this.$refs.split_dialog.show()
    },
    popover_hint (description : boolean) {
      if (!description) {
        const popover = new Popover('#input-description', {
          content: 'Description cannot be empty',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
    },
    popover_no_number (number : boolean) {
      if (!number) {
        const popover = new Popover('#input-amount', {
          content: 'Amount has to be a positive number',
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
      deep: true
    }
  }
})
</script>
<style scoped>

</style>
