<template>
  <div class="container">
    <h2>Login</h2>
    <div v-if="error">

    </div>
    <form method="post">
      <div class="form-group mb-3">
        <label for="username" class="form-label">Username</label>
        <input autofocus id="username" class="form-control" type="text" name="username" placeholder="Username">
      </div>
      <div class="form-group mb-3">
        <label for="homeserver" class="form-label">Homeserver</label>
        <input id="homeserver" class="form-control" type="text" name="homeserver" placeholder="Homeserver">
      </div>
      <div class="form-group mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" class="form-control" type="password" name="password" placeholder="Password">
      </div>
      <input class="btn btn-primary" type="submit" value="Login">
    </form>

    Don't have an account? <a href="#">Register here.</a>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Login'
})
</script>
<style scoped>

</style>
