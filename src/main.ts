import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import 'bootstrap-icons/font/bootstrap-icons.css'
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
app.config.globalProperties.sum_amount = (item: GroupedTransaction | PendingApproval | SimpleTransaction[]) : number => {
  if (Array.isArray(item)) {
    return item.reduce((sum, tx) => sum + tx.amount, 0)
  } else {
    return item.txs.reduce((sum, tx) => sum + tx.amount, 0)
  }
}
app.config.globalProperties.split_percentage = (item: GroupedTransaction | PendingApproval | SimpleTransaction[]) : Record<TxID, number> => {
  const result: Record<TxID, number> = {}
  if (Array.isArray(item)) {
    const sum = item.reduce((sum, tx) => sum + tx.amount, 0)
    for (const simple_tx of item) {
      result[simple_tx.tx_id] = simple_tx.amount / sum
    }
  } else {
    const sum = item.txs.reduce((sum, tx) => sum + tx.amount, 0)
    for (const simple_tx of item.txs) {
      result[simple_tx.tx_id] = simple_tx.amount / sum
    }
  }
  return result
}
app.config.globalProperties.to_currency_display = (num: number) : string => {
  return (num / 100).toFixed(2) + '€'
}
app.mount('#app')
