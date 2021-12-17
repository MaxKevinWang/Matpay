<template>
  <h4>Members</h4>
  <ul class="list-unstyled card chat-list mt-2 mb-0">
    <li class="clearfix" v-for="user in users" :key="user.user.user_id">
      <UserCard :user_prop="user" :can_i_kick_user="can_i_kick_user" @on-kick="on_kick" @on-ban="on_ban"/>
    </li>
    <li class="row">
      <button class="btn btn-primary" @click="on_invite_user_clicked()">Invite user</button>
    </li>
  </ul>
  <!-- Invite User Dialog -->
  <div class="modal fade" id="invite-user-modal" tabindex="-1" aria-labelledby="invite-label" aria-hidden="true">
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
              <input v-model="invite_user_id" type="text" class="form-control" id="invite-userid"
                     :placeholder="'@user:' + this.user_id.split(':')[1]">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="on_invite()">Invite</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Message Dialog -->
  <div class="modal fade" id="message-modal" tabindex="-2" aria-labelledby="message-label"
       aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="message-label">Message</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {{ dialog_message }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
  <!-- Confirm Dialog -->
  <div class="modal fade" id="confirm-modal" tabindex="-3" aria-labelledby="confirm-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirm-label">Confirm</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {{ confirm_message }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-danger" @click="on_confirm">Yes</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">No</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import UserCard from '@/components/UserCard.vue'
import { mapActions, mapGetters } from 'vuex'
import { Modal } from 'bootstrap'
import { RoomUserInfo } from '@/models/user.model'
import { deepcopy } from '@/utils/utils'

export default defineComponent({
  name: 'MemberList',
  emits: {
    'on-user-change': null,
    'on-error': (error: string) => {
      return !!error
    }
  },
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
      users: [] as Array<RoomUserInfo>,
      dialog_message: '' as string,
      confirm_message: '' as string,
      invite_user_id: null as string | null,
      invite_user_modal: null as Modal | null,
      message_modal: null as Modal | null,
      confirm_modal: null as Modal | null,
      current_operation: null as 'kick' | 'ban' | null,
      current_operation_user_id: '' as string
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('rooms', [
      'get_permission_event_for_room'
    ]),
    can_i_kick_user () {
      const my_user_type = this.users.filter(member => member.user.user_id === this.user_id)[0].user_type
      return my_user_type === 'Admin' || my_user_type === 'Moderator'
    }
  },
  components: {
    UserCard
  },
  methods: {
    ...mapActions('rooms', [
      'action_change_user_membership_on_room'
    ]),
    show_member_detail () {
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
    on_invite_user_clicked () {
      // check permission
      const permission = this.get_permission_event_for_room(this.room_id)
      const permission_value = permission.users[this.user_id]
      if (permission_value) {
        if (permission.users[this.user_id] < permission.invite) {
          this.$emit('on-error', 'You have no permission to invite user')
          return
        }
      } else if (permission.users_default < permission.invite) {
        this.$emit('on-error', 'You have no permission to invite user')
        return
      }
      this.invite_user_modal?.toggle()
    },
    async on_invite () {
      if (!this.invite_user_id || this.invite_user_id === '') {
        this.dialog_message = 'The user ID cannot be blank!'
        this.message_modal?.toggle()
      } else if (this.invite_user_id === this.user_id) {
        this.dialog_message = 'You cannot invite yourself!'
        this.message_modal?.toggle()
      } else {
        try {
          await this.action_change_user_membership_on_room({
            room_id: this.room_id,
            user_id: this.invite_user_id,
            action: 'invite'
          })
          this.invite_user_id = ''
          this.dialog_message = 'An invitation has been sent.'
          this.message_modal?.toggle()
          this.invite_user_modal?.toggle()
        } catch (error) {
          this.dialog_message = error.message
          this.message_modal?.toggle()
          this.invite_user_modal?.toggle()
        }
      }
    },
    on_kick (user_id: string) {
      this.current_operation = 'kick'
      this.current_operation_user_id = user_id
      this.confirm_message = 'Are you sure you want to kick user?'
      this.confirm_modal?.toggle()
    },
    on_ban (user_id: string) {
      this.current_operation = 'ban'
      this.current_operation_user_id = user_id
      this.confirm_message = 'Are you sure you want to ban user?'
      this.confirm_modal?.toggle()
    },
    async on_confirm () {
      try {
        await this.action_change_user_membership_on_room({
          room_id: this.room_id,
          user_id: this.current_operation_user_id,
          action: this.current_operation
        })
        this.confirm_modal?.toggle()
        this.$emit('on-user-change')
      } catch (error) {
        this.dialog_message = error.message
        this.message_modal?.toggle()
        this.confirm_modal?.toggle()
      }
    }
  },
  watch: {
    users_info: {
      handler () {
        this.users = []
        this.show_member_detail()
      },
      deep: true
    }
  },
  mounted () {
    this.invite_user_modal = new Modal(document.getElementById('invite-user-modal') as HTMLElement, {
      backdrop: false
    })
    this.message_modal = new Modal(document.getElementById('message-modal') as HTMLElement, {
      backdrop: false
    })
    this.confirm_modal = new Modal(document.getElementById('confirm-modal') as HTMLElement, {
      backdrop: false
    })
  }
})
</script>
<style scoped>
.card {
  background: #fff;
  transition: .5s;
  border: 0;
  margin-bottom: 30px;
  border-radius: .55rem;
  position: relative;
  width: 100%;
}

li {
  padding: 10px 15px;
  list-style: none;
  border-radius: 3px;
  font-size: 15px
}

li:hover {
  background: #efefef;
  cursor: pointer
}

</style>
