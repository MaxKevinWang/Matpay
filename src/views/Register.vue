<template>
  <div class="container">
    <div class="row">
      <div class="col-4">
        <h3>How to register</h3>
        MatPay itself does not support registration and storing account information. To create
        an account register on a
        <a href="https://matrix.org/faq/#what-is-a-homeserver%3F">homeserver.</a>
        We recommend to use
        <a href="https://tchncs.de/matrix">tchncs</a>.
        Once you´re on tchncs navigate to the right side and press "Create Account". You will be redirected to a new page where
        you can register your new account. The register page is for a chat client called "Element" that is also based on
        Matrix. You can use your registered account on Element and MatPay.
      </div>
      <div class="col-4">
        <img src="@/assets/CreateAccountTchncs.jpg" alt="Create Account">
      </div>
      <div class="col-4">
        <img src="@/assets/RegisterPageElement.jpg" alt="Register Page">
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Register',
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
})
</script>
<style scoped>
img {
  display: block;
  max-width: 100%;
  height: auto;
}
a:link {
  text-decoration: none;
}
</style>
