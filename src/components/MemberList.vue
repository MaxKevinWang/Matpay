<template>
  <h4>Members</h4>
  <ul class="list-unstyled card chat-list mt-2 mb-0">
    <li class="clearfix">
      <CurrentUserCard />
    </li>
    <li class="clearfix" v-for="member in members" :key="member.user_id">
      <UserCard :user="member" />
    </li>
    <li class="row">
      <button class="btn btn-primary" @click="onAddUser()">Add user</button>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CurrentUserCard from '@/components/CurrentUserCard.vue'
import UserCard from '@/components/UserCard.vue'

export default defineComponent({
  name: 'MemberList',
  data () {
    return {
      members: [
        {
          user_id: 'fsdfsdf',
          name: 'aaaa'
        }
      ]
    }
  },
  components: { UserCard, CurrentUserCard }
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
