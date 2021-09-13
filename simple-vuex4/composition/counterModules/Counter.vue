<template>
  <div id="app">
    Clicked: {{ count }} times, count is {{ evenOrOdd }}.
    <button @click="increment">+</button>
    <hr>
    a模块： {{aCount}} <button @click="aIncrement"> 增加</button> <br>
    b模块： {{bCount}} <button @click="bIncrement"> 增加</button>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { getCurrentInstance } from 'vue'

export default {
  setup () {
    const store = useStore()
    console.log(store)
    const instance = getCurrentInstance()

    return {
      count: computed(() => store.state.count),
      evenOrOdd: computed(() => store.getters.evenOrOdd),
      increment: () => store.dispatch('increment'),
      decrement: () => store.dispatch('decrement'),
      incrementIfOdd: () => store.dispatch('incrementIfOdd'),
      incrementAsync: () => store.dispatch('incrementAsync'),
      aCount: computed(() => store.state.aCount.count),
      bCount: computed(() => store.state.bCount.count),
      aIncrement: () => store.dispatch('aCount/increment', 3),
      bIncrement: () => store.dispatch('bCount/increment', 1)
    }
  }
}
</script>
