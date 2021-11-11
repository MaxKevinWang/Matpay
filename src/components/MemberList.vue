<template>
  <h4>Members</h4>
  <ul class="list-unstyled card chat-list mt-2 mb-0">
    <li class="clearfix" v-for="member in members" :key="member.user_id">
      <UserCard :member_prop="member"/>
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
  <!-- Invite Message Dialog -->
  <div class="modal fade" id="invite-message-modal" tabindex="-2" aria-labelledby="invite-message-label"
       aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="invite-message-label">Invite</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          {{ invite_message }}
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import UserCard from '@/components/UserCard.vue'
import { mapActions, mapGetters } from 'vuex'
import { MatrixRoomPermissionConfiguration } from '@/interface/event.interface'
import { Modal } from 'bootstrap'

export default defineComponent({
  name: 'MemberList',
  emits: {
    'on-invite-user': null,
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
      invite_message: '' as string,
      invite_user_id: null as string | null
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('rooms', [
      'get_room_permissions'
    ])
  },
  components: {
    UserCard
  },
  methods: {
    ...mapActions('rooms', [
      'action_invite_user_to_room'
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
      // invite user dialog
      const invite_user_modal = new Modal(document.getElementById('invite-user-modal') as HTMLElement, {
        backdrop: false
      })
      invite_user_modal.toggle()
    },
    on_invite () {
      const invite_message_model = new Modal(document.getElementById('invite-message-modal') as HTMLElement, {
        backdrop: false
      })
      if (!this.invite_user_id || this.invite_user_id === '') {
        this.invite_message = 'The user ID cannot be blank!'
        invite_message_model.toggle()
      } else if (this.invite_user_id === this.user_id) {
        this.invite_message = 'You cannot invite yourself!'
        invite_message_model.toggle()
      } else {
        this.action_invite_user_to_room({
          room_id: this.room_id,
          user_id: this.invite_user_id
        })
          .then(() => {
            this.invite_user_id = ''
            this.invite_message = 'An invitation has been sent.'
            invite_message_model.toggle()
          })
          .catch(error => {
            this.invite_message = error.message
            invite_message_model.toggle()
          })
      }
    }
  },
  watch: {
    member_list: {
      handler () {
        this.show_member_detail()
      },
      deep: true
    }
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
