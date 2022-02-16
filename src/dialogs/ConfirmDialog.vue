<template>
  <div class="modal fade" id="confirm-modal" tabindex="-1" aria-labelledby="confirm-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirm-label">Confirm</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p style="white-space: pre-wrap;">{{ confirm_message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" id="yes-button" @click="on_confirm">Yes</button>
          <button type="button" class="btn btn-secondary" @click="on_reject">No</button>
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

export default defineComponent({
  name: 'ConfirmDialog',
  data () {
    return {
      confirm_message: '' as string,
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      on_confirm: this.hide as () => void,
      on_reject: this.hide as () => void
    }
  },
  computed: {
  },
  components: {
  },
  methods: {
    prompt_confirm (content: string, confirm_callback: () => void, reject_callback?: () => void) {
      this.confirm_message = content
      this.on_confirm = () : void => {
        confirm_callback()
        this.hide()
      }
      this.on_reject = () : void => {
        if (reject_callback) {
          reject_callback()
        }
        this.hide()
      }
      this.show()
    },
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
    this.modal_control = new Modal(document.getElementById('confirm-modal') as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>

</style>
