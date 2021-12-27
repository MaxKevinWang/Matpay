<template>
  <div class="modal fade" :id="'settlement-modal_' + this.user_clicked.user.user_id" tabindex="-1"
       aria-labelledby="settlement-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="settlement-label">Settlement</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>{{ user_clicked.displayname }}</p>
          <p>{{}}</p>
          <h3>{{ '0$' }}</h3>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Settle</button>
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
import { RoomUserInfo, User } from '@/models/user.model'

export default defineComponent({
  name: 'SettlementDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    user_clicked: {
      type: Object as PropType<RoomUserInfo>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      amount: 0 as number
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ])
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
    const id = 'settlement-modal_' + this.user_clicked?.user.user_id
    this.modal_control = new Modal(document.getElementById(id) as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>
.modal-body h3 {
  color: greenyellow;
}
</style>
