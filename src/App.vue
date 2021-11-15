<template>
  <nav class="navbar navbar-expand-md navbar-light bg-light">
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
            <label aria-current="page" class="nav-link" v-if="this.is_logged_in">{{ this.user_id }}</label>
          </li>
          <li id="login_logout_button" class="nav-item">
            <router-link id="login_button" active-class="active" to="/login" v-if="!this.is_logged_in" class="nav-link"
                         aria-current="page">Login
            </router-link>
            <button id="logout_button" @click="logout()" v-if="this.is_logged_in" type="button"
                    class="btn btn-light nav-link"
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
import { mapActions, mapGetters } from 'vuex'

export default defineComponent({
  name: 'App',
  data () {
    return {}
  },
  computed: {
    ...mapGetters('auth', [
      'is_logged_in',
      'user_id',
      'homeserver'
    ])
  },
  methods: {
    ...mapActions('auth', [
      'action_logout'
    ]),
    logout () {
      this.action_logout()
      this.$router.push('/login')
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
