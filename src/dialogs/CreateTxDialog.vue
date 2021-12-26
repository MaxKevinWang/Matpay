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
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-receipt" viewBox="0 0 16 16">
                <path d="M1.92.506a.5.5 0 0 1 .434.14L3 1.293l.646-.647a.5.5 0 0 1 .708 0L5 1.293l.646-.647a.5.5 0 0 1 .708 0L7 1.293l.646-.647a.5.5 0 0 1 .708 0L9 1.293l.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .801.13l.5 1A.5.5 0 0 1 15 2v12a.5.5 0 0 1-.053.224l-.5 1a.5.5 0 0 1-.8.13L13 14.707l-.646.647a.5.5 0 0 1-.708 0L11 14.707l-.646.647a.5.5 0 0 1-.708 0L9 14.707l-.646.647a.5.5 0 0 1-.708 0L7 14.707l-.646.647a.5.5 0 0 1-.708 0L5 14.707l-.646.647a.5.5 0 0 1-.708 0L3 14.707l-.646.647a.5.5 0 0 1-.801-.13l-.5-1A.5.5 0 0 1 1 14V2a.5.5 0 0 1 .053-.224l.5-1a.5.5 0 0 1 .367-.27zm.217 1.338L2 2.118v11.764l.137.274.51-.51a.5.5 0 0 1 .707 0l.646.647.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.646.646.646-.646a.5.5 0 0 1 .708 0l.509.509.137-.274V2.118l-.137-.274-.51.51a.5.5 0 0 1-.707 0L12 1.707l-.646.647a.5.5 0 0 1-.708 0L10 1.707l-.646.647a.5.5 0 0 1-.708 0L8 1.707l-.646.647a.5.5 0 0 1-.708 0L6 1.707l-.646.647a.5.5 0 0 1-.708 0L4 1.707l-.646.647a.5.5 0 0 1-.708 0l-.509-.51z"/>
                <path d="M3 4.5a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 1 1 0 1h-6a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5zm8-6a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5z"/>
              </svg>
            </span>
            <input v-model="description" type="text" class="form-control" placeholder="Description" aria-label="Description" aria-describedby="basic-addon1" data-bs-toggle="popover" id="input-description">
          </div>
          <div class="input-group">
            <span id="basic-addon1" class="input-group-text">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-currency-euro" viewBox="0 0 16 16">
                <path d="M4 9.42h1.063C5.4 12.323 7.317 14 10.34 14c.622 0 1.167-.068 1.659-.185v-1.3c-.484.119-1.045.17-1.659.17-2.1 0-3.455-1.198-3.775-3.264h4.017v-.928H6.497v-.936c0-.11 0-.219.008-.329h4.078v-.927H6.618c.388-1.898 1.719-2.985 3.723-2.985.614 0 1.175.05 1.659.177V2.194A6.617 6.617 0 0 0 10.341 2c-2.928 0-4.82 1.569-5.244 4.3H4v.928h1.01v1.265H4v.928z"/>
              </svg>
            </span>
            <input v-model="amount" type="text" class="form-control" placeholder="Amount" aria-label="Amount" aria-describedby="basic-addon1" data-bs-toggle="popover" id="input-amount">
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
  <SplitDialog ref="split_dialog"/>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import SplitDialog from '@/dialogs/SplitDialog.vue'
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { Modal, Popover } from 'bootstrap'

export default defineComponent({
  name: 'CreateTxDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    room_name: {
      type: String as PropType<string>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      description: '' as string,
      amount: '' as string
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
          content: 'Amount has to be a number',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
      }
    },
    on_confirm () {
      if (this.description.length >= 1 && this.is_number()) {
        this.amount = ''
        this.description = ''
        this.hide()
      } else {
        this.popover_hint(this.description.length >= 1)
        this.popover_no_number(this.is_number())
      }
    },
    is_number () : boolean {
      if (this.amount.includes(',')) {
        const split_amount = this.amount.split(',')
        if (split_amount.length === 2 && split_amount[1].length <= 2 && split_amount[0].match(/^\d+$/) !== null && split_amount[1].match(/^\d+$/) !== null) {
          return true
        } else {
          return false
        }
      } else {
        if (this.amount.match(/^\d+$/) !== null) {
          return true
        } else {
          return false
        }
      }
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('create-tx-modal') as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>

</style>
