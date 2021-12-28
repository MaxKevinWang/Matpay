<template>
  <div class="modal fade" id="Split-modal" tabindex="-1" aria-labelledby="Split-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="Split-label">Split Configuration</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3 form-control" v-for="simple_tx in simple_txs_info" :key="simple_tx.to">
            <label class="input-group-text" for="inputGroupSelect01">{{ simple_tx.to.displayname }}</label>
            <input type="text" class="form-control" placeholder="Split value" aria-label="Recipient's username" aria-describedby="basic-addon2" id="split-perc">
            <span class="input-group-text" id="basic-addon2">%</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="check_selected">Save</button>
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
import { deepcopy } from '@/utils/utils'
import { Modal, Popover } from 'bootstrap'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'
import { SimpleTransaction } from '@/models/transaction.model'
import { MatrixUserID } from '@/models/id.model'

export default defineComponent({
  name: 'SplitModifyDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    },
    users_info: {
      type: Object as PropType<Array<RoomUserInfo>>
    },
    simple_txs: {
      type: Object as PropType<Array<SimpleTransaction>>
    }
  },
  data () {
    return {
      modal_control: null as Modal | null,
      is_shown: false as boolean,
      users: [] as Array<RoomUserInfo>,
      selected_members: [] as Array<MatrixUserID>,
      simple_txs_info: [] as Array<SimpleTransaction>
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
    check_selected () {
      if (this.selected_members.length <= 0) {
        const popover = new Popover('#input-description', {
          content: 'At least one member should be selected',
          container: 'body'
        })
        popover.show()
        setTimeout(() => popover.hide(), 4000)
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
    simple_txs: {
      handler () {
        if (this.simple_txs) {
          this.simple_txs_info = this.simple_txs
        }
      },
      immediate: true
    }
  }
})
</script>
<style scoped>

</style>
