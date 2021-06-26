import { createApp } from 'vue'
import Counter from './Counter.vue'
import store from './store'

createApp(Counter).use(store).mount('#app')

