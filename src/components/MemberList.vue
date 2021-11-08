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
        is_self: boolean
      }>,
      displayname_table: {} as Record<string, string[]> // hashtable for display name calculation
    }
  },
  computed: {
    ...mapGetters('auth', [
      'user_id'
    ])
  },
  components: {
    UserCard
  },
  methods: {
    show_member_detail () {
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
            this.members.push({
              user_id: ids[0],
              displayname: displayname,
              avatar_url: this.member_list.filter(i => i.user_id === ids[0])[0].avatar_url,
              is_self: ids[0] === self_user_id
            })
          } else {
            for (const repeated_id of ids) {
              this.members.push({
                user_id: repeated_id,
                displayname: displayname + ' (' + repeated_id + ')',
                avatar_url: this.member_list.filter(i => i.user_id === repeated_id)[0].avatar_url,
                is_self: repeated_id === self_user_id
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
  created () {
    this.show_member_detail()
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
