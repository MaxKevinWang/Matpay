<template>
  <h4>Members</h4>
  <ul class="list-unstyled card chat-list mt-2 mb-0">
    <li class="clearfix" v-for="member in members" :key="member.user_id">
      <UserCard :member_prop="member"/>
    </li>
    <li class="row">
      <button class="btn btn-primary" @click="onAddUser()">Add user</button>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import UserCard from '@/components/UserCard.vue'
import { mapGetters } from 'vuex'
import { MatrixRoomPermissionConfiguration } from '@/interface/event.interface'

export default defineComponent({
  name: 'MemberList',
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
      permission: {} as MatrixRoomPermissionConfiguration
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
