<template>
  <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar">
  <div class="about">
    <div class="name">Vincent Porter</div>
    <div class="status">  left 7 mins ago </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'UserCard',
  props: ['user']
})

</script>
<style scoped>

img {
  width: 45px;
  border-radius: 50%;
  float: left;
}
.name {
  font-size: 15px;
}
.about {
  float: left;
  padding-left: 8px
}
.status {
  color: #999;
  font-size: 13px
}

</style>
