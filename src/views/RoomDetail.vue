<template>
<div class="container">
  <div class="row">
  <h2>Room: {{ this.room_id }}</h2>
  </div>
  <div class="row clearfix">
    <div class="col-lg-3 chat-frame">
      <MemberList :room_id="room_id" />
    </div>
    <div class="col-lg-9 chat-frame">
      <h4>Chat</h4>
      <p>To be done.</p>
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MemberList from '@/components/MemberList.vue'

export default defineComponent({
  name: 'RoomDetail',
  computed: {
    room_id () : string {
      return this.$route.params.room_id as string
    }
  },
  components: {
    MemberList
  }
})
</script>
<style scoped>
.chat-frame {
  width: 280px;
  left: 0;
  top: 0;
  padding: 20px;
  z-index: 7
}

.chat-frame {
  -moz-transition: .5s;
  -o-transition: .5s;
  -webkit-transition: .5s;
  transition: .5s
}
</style>
