<template>
  <h4>Members</h4>
  <ul class="list-unstyled card chat-list mt-2 mb-0">
    <li class="clearfix" v-for="member in members" :key="member.user_id">
      <UserCard :member_prop="member" :can_i_kick_user="can_i_kick_user" @on-kick="on_kick" @on-ban="on_ban"/>
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
import { MatrixRoomPermissionConfiguration } from '@/interface/RoomsEvent.interface'
import { Modal } from 'bootstrap'

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
    member_list: {
      type: Object as PropType<Array<{
        user_id: string,
        displayname: string | null,
        avatar_url: string | undefined
      }>>
    }
  },
  data () {
    return {
      members: [] as Array<{
        user_id: string,
        displayname: string,
        avatar_url: string | undefined,
        is_self: boolean,
        user_type: 'Member' | 'Moderator' | 'Admin'
      }>,
      displayname_table: {} as Record<string, string[]>,
      permission: {} as MatrixRoomPermissionConfiguration,
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
      'get_room_permissions'
    ]),
    can_i_kick_user () {
      const my_user_type = this.members.filter(member => member.user_id === this.user_id)[0].user_type
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
      // update permission data
      this.permission = this.get_room_permissions(this.room_id)
      // calculate display name according to Specification 13.2.2.3
      this.displayname_table = {}
      if (this.member_list) {
        for (const i of this.member_list) {
          if (i.displayname === null || i.displayname === '') {
            if (!this.displayname_table[i.user_id]) {
              this.displayname_table[i.user_id] = []
            }
            this.displayname_table[i.user_id].push(i.user_id)
          } else {
            if (!this.displayname_table[i.displayname]) {
              this.displayname_table[i.displayname] = []
            }
            this.displayname_table[i.displayname].push(i.user_id)
          }
        }
        const self_user_id = this.user_id
        for (const [displayname, ids] of Object.entries(this.displayname_table)) {
          if (ids.length === 1) {
            const member_object = this.member_list.filter(i => i.user_id === ids[0])[0]
            this.members.push({
              user_id: ids[0],
              displayname: displayname,
              avatar_url: member_object.avatar_url,
              is_self: ids[0] === self_user_id,
              user_type: this.permission.users[ids[0]] >= 100
                ? 'Admin'
                : this.permission.users[ids[0]] >= 50 ? 'Moderator' : 'Member'
            })
          } else {
            for (const repeated_id of ids) {
              this.members.push({
                user_id: repeated_id,
                displayname: displayname + ' (' + repeated_id + ')',
                avatar_url: this.member_list.filter(i => i.user_id === repeated_id)[0].avatar_url,
                is_self: repeated_id === self_user_id,
                user_type: this.permission.users[repeated_id] >= 100
                  ? 'Admin'
                  : this.permission.users[repeated_id] >= 50 ? 'Moderator' : 'Member'
              })
            }
          }
        }
        // put yourself always at the first
        for (let i = 0; i < this.members.length; i++) {
          if (this.members[i].is_self) {
            this.members.unshift(this.members.splice(i, 1)[0])
            break
          }
        }
      }
      return this.members
    },
    on_invite_user_clicked () {
      // check permission
      const permission_value = this.permission.users[this.user_id]
      if (permission_value) {
        if (this.permission.users[this.user_id] < this.permission.invite) {
          this.$emit('on-error', 'You have no permission to invite user')
          return
        }
      } else if (this.permission.users_default < this.permission.invite) {
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
    member_list: {
      handler () {
        this.members = []
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
