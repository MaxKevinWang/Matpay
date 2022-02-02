<template>
  <div>
    <h4>Members</h4>
    <ul class="list-unstyled card chat-list mt-2 mb-0">
      <li class="clearfix" v-for="user in users_displayed" :key="user.user.user_id" :data-test="user.user.user_id">
        <UserCard :room_id="room_id" :user_prop="user" :can_i_kick_user="can_i_kick_user"
                  @on-kick="on_kick"
                  @on-ban="on_ban"
                  @on-leave="on_leave"
                  @on-error="on_error"/>
      </li>
      <li class="row">
        <button class="btn btn-primary" @click="on_invite_user_clicked()">Invite user</button>
      </li>
    </ul>
    <UserInviteDialog ref="invite_dialog" :room_id="room_id"/>
    <ConfirmDialog ref="confirm_dialog" />
  </div>
</template>

<script lang="ts">
/* eslint-disable no-unused-expressions */
import { defineComponent, PropType } from 'vue'
import UserCard from '@/components/UserCard.vue'
import { mapActions, mapGetters } from 'vuex'
import { RoomUserInfo } from '@/models/user.model'
import UserInviteDialog from '@/dialogs/UserInviteDialog.vue'
import ConfirmDialog from '@/dialogs/ConfirmDialog.vue'
import { cloneDeep } from 'lodash'

export default defineComponent({
  name: 'MemberList',
  emits: {
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
      current_operation: null as 'kick' | 'ban' | null,
      current_operation_user_id: '' as string
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ]),
    ...mapGetters('user', [
      'get_permissions_for_room'
    ]),
    can_i_kick_user () {
      const my_user_type = this.users.filter(member => member.user.user_id === this.user_id)[0].user_type
      return my_user_type === 'Admin' || my_user_type === 'Moderator'
    },
    ...mapGetters('tx', [
      'get_open_balance_against_user_for_room'
    ]),
    users_displayed () : Array<RoomUserInfo> {
      return this.users.filter(user => user.user_type !== 'Left' ||
        (user.user_type === 'Left' &&
          this.get_open_balance_against_user_for_room(this.room_id, this.user_id, user.user.user_id) !== 0))
    }
  },
  components: {
    ConfirmDialog,
    UserInviteDialog,
    UserCard
  },
  methods: {
    ...mapActions('user', [
      'action_change_user_membership_on_room'
    ]),
    ...mapActions('rooms', [
      'action_leave_room'
    ]),
    show_member_detail () {
      const users_tmp = cloneDeep(this.users_info)
      if (users_tmp) {
        // put yourself always at the first
        for (let i = 0; i < users_tmp.length; i++) {
          if (users_tmp[i].is_self) {
            users_tmp.unshift(users_tmp.splice(i, 1)[0])
            break
          }
        }
        // put left users to last
        const left_users_info = users_tmp.filter(i => i.user_type === 'Left')
        for (const left_user of left_users_info) {
          users_tmp.splice(users_tmp.indexOf(left_user), 1)
          users_tmp.push(left_user)
        }
        this.users = users_tmp
      }
    },
    on_error (error: string) {
      this.$emit('on-error', error)
    },
    on_invite_user_clicked () {
      // check permission
      const permission = this.get_permissions_for_room(this.room_id)
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
      this.$refs.invite_dialog.show()
    },
    on_kick (user_id: string) {
      this.current_operation = 'kick'
      this.current_operation_user_id = user_id
      const prompt = 'Are you sure you want to kick user?'
      this.$refs.confirm_dialog.prompt_confirm(prompt, this.on_confirm)
    },
    on_ban (user_id: string) {
      this.current_operation = 'ban'
      this.current_operation_user_id = user_id
      const prompt = 'Are you sure you want to ban user?'
      this.$refs.confirm_dialog.prompt_confirm(prompt, this.on_confirm)
    },
    on_leave () {
      const prompt = `Are you sure you want to leave room?
Leaving this room will immediately settle all open balance others owing to you. Balance of you owing others will remain intact.`
      this.$refs.confirm_dialog.prompt_confirm(prompt, this.on_leave_confirm)
    },
    async on_confirm () {
      try {
        await this.action_change_user_membership_on_room({
          room_id: this.room_id,
          user_id: this.current_operation_user_id,
          action: this.current_operation
        })
      } catch (error) {
        this.$emit('on-error', error)
      }
    },
    async on_leave_confirm () {
      try {
        await this.action_leave_room({
          room_id: this.room_id
        })
        this.$router.push({
          name: 'rooms'
        })
      } catch (error) {
        this.$emit('on-error', error)
      }
    }
  },
  watch: {
    users_info: {
      handler () {
        this.users = []
        this.show_member_detail()
      },
      immediate: true
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
