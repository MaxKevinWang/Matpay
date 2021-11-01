<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">MatPay</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link to="/home" class="nav-link" aria-current="page">Home</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/rooms" class="nav-link" aria-current="page">Rooms</router-link>
          </li>
        </ul>
        <ul class="navbar-nav ml-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <label aria-current="page" v-if="is_logged_in">{{ username }}</label>
          </li>
          <li class="nav-item">
            <router-link to="/login" v-if="!is_logged_in" class="nav-link" aria-current="page">Login</router-link>
            <button v-if="is_logged_in" type="button" class="btn btn-light" aria-current="page">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <router-view/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { AuthInfo } from '@/models/AuthInfo.model'

export default defineComponent({
  name: 'App',
  computed: {
    is_logged_in () : boolean {
      return !!localStorage.getItem('auth_info')
    },
    username () : string {
      const auth_info : AuthInfo = JSON.parse(localStorage.getItem('auth_info') || '')
      return auth_info.user_id
    }
  }
})
</script>
<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.navbar {
  margin-bottom: 30px;
}

</style>
