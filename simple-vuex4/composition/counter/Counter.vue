<template>
  <div id="app">
    Clicked: {{ count }} times, count is {{ evenOrOdd }}.
    <br>
    {{$store.getters.evenOrOdd}}
    <button @click="increment">+</button>
    <button @click="decrement">-</button>
    <button @click="incrementIfOdd">Increment if odd</button>
    <button @click="incrementAsync">Increment async</button>
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
    console.log(instance, '当前组件的实例')

    return {
      count: computed(() => store.state.count),
      evenOrOdd: computed(() => store.getters.evenOrOdd),
      increment: () => store.dispatch('increment'),
      decrement: () => store.dispatch('decrement'),
      incrementIfOdd: () => store.dispatch('incrementIfOdd'),
      incrementAsync: () => store.dispatch('incrementAsync')
    }
  }
}
</script>
