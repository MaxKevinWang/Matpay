import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import axios from 'axios'

// register axios interceptor
axios.interceptors.request.use(function (config) {
  if (localStorage.getItem('access_token')) {
    if (!config.headers) {
      config.headers = {}
    }
    config.headers.Authorization = 'Bearer ' + localStorage.getItem('access_token')
  }
  return config
}, function (error) {
  return Promise.reject(error)
})
createApp(App).use(store).use(router).mount('#app')
