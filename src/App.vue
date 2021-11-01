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
            <router-link to="/" active-class="active" class="nav-link" aria-current="page">Home
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/rooms" active-class="active" class="nav-link" aria-current="page">
              Rooms
            </router-link>
          </li>
        </ul>
        <ul class="navbar-nav ml-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <label aria-current="page" class="nav-link" v-if="is_logged_in">{{ this.username }}</label>
          </li>
          <li class="nav-item">
            <router-link active-class="active" to="/login" v-if="!this.is_logged_in" class="nav-link"
                         aria-current="page">Login
            </router-link>
            <button @click="logout()" v-if="this.is_logged_in" type="button" class="btn btn-light nav-link"
                    aria-current="page">Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  <router-view/>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App',
  data () {
    return {
      is_logged_in: false as boolean,
      username: '' as string
    }
  },
  methods: {
    updateNavBarLogin () {
      this.is_logged_in = !!localStorage.getItem('access_token')
      this.username = localStorage.getItem('user_id') || ''
    },
    logout () {
      console.log('implement logout here.')
    }
  },
  created () {
    this.updateNavBarLogin()
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
