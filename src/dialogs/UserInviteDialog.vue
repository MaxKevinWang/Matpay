<template>
  <!-- Invite User Dialog -->
  <div class="modal fade" id="user-invite-modal" tabindex="-1" aria-labelledby="invite-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="invite-label">Invite User</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form>
            <div class="form-group">
              <label for="invite-userid">User ID</label>
              <input v-model="invite_user_id" data-bs-toggle="popover" type="text" class="form-control" id="invite-userid"
                     :placeholder="'@user:' + this.user_id.split(':')[1]">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button id="invite-confirm" type="button" class="btn btn-primary" @click="on_invite()">Invite</button>
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
  name: 'UserInviteDialog',
  props: {
    room_id: {
      type: String as PropType<string>
    }
  },
  data () {
    return {
      invite_user_id: null as string | null,
      modal_control: null as Modal | null,
      is_shown: false as boolean
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('rooms', [
      'get_permission_event_for_room'
    ])
  },
  emits: ['on-success'],
  methods: {
    ...mapActions('user', [
      'action_change_user_membership_on_room'
    ]),
    show () {
      this.modal_control?.show()
      this.is_shown = true
    },
    hide () {
      this.modal_control?.hide()
      this.is_shown = false
    },
    popover_hint (content: string) {
      const popover = new Popover('#invite-userid', {
        content: content,
        container: 'body'
      })
      popover.show()
      setTimeout(() => popover.hide(), 4000)
    },
    async on_invite () {
      if (!this.invite_user_id || this.invite_user_id === '') {
        this.popover_hint('The user ID cannot be blank!')
      } else if (this.invite_user_id === this.user_id) {
        this.popover_hint('You cannot invite yourself!')
      } else {
        try {
          await this.action_change_user_membership_on_room({
            room_id: this.room_id,
            user_id: this.invite_user_id,
            action: 'invite'
          })
          this.$emit('on-success', `Invitation sent to user ${this.invite_user_id}.`)
          this.invite_user_id = ''
          this.hide()
        } catch (error) {
          this.popover_hint('Error: ' + error)
        }
      }
    }
  },
  mounted () {
    this.modal_control = new Modal(document.getElementById('user-invite-modal') as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>

</style>
