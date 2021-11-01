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
               placeholder="Username">
      </div>
      <div class="form-group mb-3">
        <label for="homeserver" class="form-label">Homeserver</label>
        <input v-model="homeserver" id="homeserver" class="form-control" type="text" name="homeserver"
               placeholder="Homeserver">
      </div>
      <div class="form-group mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" id="password" class="form-control" type="password" name="password"
               placeholder="Password">
      </div>
      <input class="btn btn-primary" @click="login()" value="Login">
    </form>

    Don't have an account? <a href="#">Register here.</a>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { GETLoginResponse, POSTLoginResponse } from '@/interface/login.interface'
import { mapGetters } from 'vuex'

export default defineComponent({
  name: 'Login',
  data () {
    return {
      username: '' as string,
      homeserver: 'https://tchncs.de' as string,
      password: '' as string,
      error: '' as string
    }
  },
  computed: {
    ...mapGetters('auth', [
      'device_id'
    ])
  },
  methods: {
    login () {
      if (this.username === '' || this.homeserver === '' || this.password === '') {
        this.error = 'Field missing!'
        return
      }
      axios.get<GETLoginResponse>(`${this.homeserver}/_matrix/client/r0/login`)
        .then(response => {
          if (!response.data.flows.map(i => i.type).includes('m.login.password')) {
            throw new Error('Homeserver does not support password authentication')
          } else {
            return axios.post<POSTLoginResponse>(`${this.homeserver}/_matrix/client/r0/login`, {
              type: 'm.login.password',
              identifier: {
                type: 'm.id.user',
                user: this.username
              },
              password: this.password,
              device_id: this.device_id
            }, {
              validateStatus: () => true // Always resolve unless we throw an error manually
            })
          }
        })
        .then(response => {
          console.log(response)
          if (response.status === 200) {
            this.$store.commit('auth/mutation_login', {
              user_id: response.data.user_id,
              access_token: response.data.access_token,
              device_id: response.data.device_id,
              homeserver: this.homeserver
            })
            this.$router.push('/rooms')
          } else {
            throw new Error('Authentication failed!')
          }
        })
        .catch(reason => {
          this.error = reason
        })
    }
  }
})
</script>
<style scoped>

</style>
