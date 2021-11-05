<template>
  <img src="https://bootdey.com/img/Content/avatar/avatar1.png" alt="avatar">
  <div class="about">
    <div class="name">HEHEHE</div>
    <div class="status">Yourself, admin</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CurrentUserCard'
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
