<template>
  <div class="modal fade" id="room-create-modal" tabindex="-1" aria-labelledby="room-create-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="room-create-label">Create Room</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <label for="room-name">User ID</label>
          <input v-model="room_name" data-bs-toggle="popover" type="text" class="form-control" id="room-name"
                 placeholder="New Room">
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="on_create()">Create</button>
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
  name: 'CreateRoomDialog',
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      room_name: null as string | null
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
    },
    on_create () {

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
