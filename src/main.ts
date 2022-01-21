import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
import axios from 'axios'
import { split_percentage, sum_amount, to_currency_display } from '@/utils/utils'

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
// response interceptor: 401 => relogin
axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response && error.response.status === 401) {
    // discard all invalid credentials
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    // force relogin
    router.push({
      name: 'login',
      query: {
        force: 1
      }
    })
  }
  return Promise.reject(error)
})
const app = createApp(App)
app.use(store).use(router)
app.config.globalProperties.sum_amount = sum_amount
app.config.globalProperties.split_percentage = split_percentage
app.config.globalProperties.to_currency_display = to_currency_display
app.mount('#app')
