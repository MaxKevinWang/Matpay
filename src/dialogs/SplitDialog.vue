<template>
  <div class="modal fade" id="Split-modal" tabindex="-1" aria-labelledby="Split-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="Split-label">Split Configuration</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3 form-control" v-for="user in users" :key="user.user.user_id">
            <span class="input-group-text" id="basic-addon3" v-if="user.is_self">
              <input class="form-check-input" type="checkbox" value="" id="flexCheckCheckedDisabled" checked disabled>
            </span>
            <span class="input-group-text" id="basic-addon3" v-else>
              <input class="form-check-input" type="checkbox" value="" id="flexCheckDefault" @click="select_member()">
            </span>
            <label class="input-group-text" for="inputGroupSelect01">{{ user.displayname }}</label>
            <input type="text" class="form-control" placeholder="Split value" aria-label="Recipient's username" aria-describedby="basic-addon2" id="split-perc">
            <span class="input-group-text" id="basic-addon2">%</span>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import { mapActions, mapGetters } from 'vuex'
import { RoomUserInfo } from '@/models/user.model'
import { deepcopy } from '@/utils/utils'
import { Modal, Popover } from 'bootstrap'
import CreateTxDialog from '@/dialogs/CreateTxDialog.vue'

export default defineComponent({
  name: 'SplitDialog',
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
      users: [] as Array<RoomUserInfo>
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
    show_users () {
      const users_tmp = deepcopy(this.users_info)
      if (users_tmp) {
        // put yourself always at the first
        for (let i = 0; i < users_tmp.length; i++) {
          if (users_tmp[i].is_self) {
            users_tmp.unshift(users_tmp.splice(i, 1)[0])
            break
          }
        }
        this.users = users_tmp
      }
    },
    select_member () {

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
        this.users = []
        this.show_users()
      },
      deep: true
    }
  }
})
</script>
<style scoped>

</style>
