<template>
  <div class="container">
    <h2>Login</h2>
    <div class="alert alert-danger" role="alert" v-if="error !== ''">
      {{ error }}
    </div>
    <form method="post">
      <div class="form-group mb-3">
        <label for="username" class="form-label">Username</label>
        <input v-model="username" type="text" autofocus id="username" class="form-control" name="username"
               placeholder="Username" @keyup.enter="login">
      </div>
      <div class="form-group mb-3">
        <label for="homeserver" class="form-label">Homeserver</label>
        <input v-model="homeserver" id="homeserver" class="form-control" type="text" name="homeserver"
               placeholder="Homeserver" @keyup.enter="login">
      </div>
      <div class="form-group mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" id="password" class="form-control" type="password" name="password"
               placeholder="Password" @keyup.enter="login">
      </div>
      <button type="button" class="btn btn-primary" @click="login" id="login">
        Login
        <span
          v-if="spin"
          class="spinner-login spinner-border spinner-border-sm"
          role="status"
          aria-hidden="true">
        </span>
      </button>
    </form>
    Don't have an account? <router-link to="register">Register here.</router-link>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { mapActions, mapGetters } from 'vuex'

export default defineComponent({
  name: 'Login',
  data () {
    return {
      username: '' as string,
      homeserver: this.$store.getters['auth/homeserver'] || 'https://tchncs.de' as string,
      password: '' as string,
      error: '' as string,
      spin: false as boolean
    }
  },
  computed: {
    ...mapGetters('auth', [
      'device_id'
    ])
  },
  methods: {
    ...mapActions('sync', [
      'action_sync_state'
    ]),
    ...mapActions('auth', [
      'action_login'
    ]),
    async login () {
      if (this.username === '' || this.homeserver === '' || this.password === '') {
        this.error = 'Field missing!'
        return
      }
      try {
        this.spin = true
        await this.action_login({
          username: this.username,
          homeserver: this.homeserver,
          password: this.password
        })
        await this.$router.push('/rooms')
        this.spin = false
        this.error = ''
      } catch (reason: unknown) {
        this.error = (reason as Error).toString()
        this.spin = false
      }
    }
  },
  mounted () {
    if (this.$route.query.force) {
      this.error = 'Error: your login has expired. Please relogin.'
    }
  }
})
</script>
<style scoped>

</style>
