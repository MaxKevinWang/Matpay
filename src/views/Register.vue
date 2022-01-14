<template>
  <div class="container">
    <div class="txt_img">
      <h3>How to register</h3>
      MatPay itself does not support registration and storing account information. To create
      an account register on a
      <a class="btn btn-dark" href="https://matrix.org/faq/#what-is-a-homeserver%3F" role="button">homeserver.</a>
      We recommend to use
      <a class="btn btn-dark" href="https://tchncs.de/matrix" role="button">tchncs</a>.<br>
      Once you´re on tchncs navigate to the right side and press "Create Account". You will be redirected to a new page where
      you can register your new account.
    </div>
    <img src="@/assets/abstract-grunge-decorative-relief-navy-blue-stucco-wall-texture-wide-angle-rough-colored-background.jpg" alt="Background Image" width="1000" height="300">
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
  width: 100%;
  height: auto;
  opacity: 1;
}
.txt_img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 18px;
  font-weight: 1000;
  color: #bbbbbb;
}
a:link {
  text-decoration: none;
}
</style>
