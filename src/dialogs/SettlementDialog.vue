<template>
  <div class="modal fade" id="settlement-modal" tabindex="-1" aria-labelledby="settlement-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="settlement-label">Settlement</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>{{homeUser.displayname}}</p>
          <p>{{"asshole"}}</p>
          <h3>{{"0$"}}</h3>
          <button type="button" class="btn btn-primary">settle</button>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">OK</button>
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
import { User } from '@/models/user.model'

export default defineComponent({
  name: 'SettlementDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      homeUser: {} as User,
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
    this.modal_control = new Modal(document.getElementById('settlement-modal') as HTMLElement, {
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
