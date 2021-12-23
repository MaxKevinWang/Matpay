import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import axios from 'axios'
import { GroupedTransaction, PendingApproval, SimpleTransaction } from '@/models/transaction.model'
import { TxID } from '@/models/id.model'

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
const app = createApp(App)
app.use(store).use(router)
app.config.globalProperties.sum_amount = (item: GroupedTransaction | PendingApproval) : number => {
  return item.txs.reduce((sum, tx) => sum + tx.amount, 0)
}

app.mount('#app')
