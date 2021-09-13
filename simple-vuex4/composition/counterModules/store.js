import { createStore } from 'vuex'

const state = {
  count: 0
}

const mutations = {
  increment (state) {
    state.count++
  },
}

const actions = {
  increment: ({ commit }) => commit('increment'),
}

const getters = {
  evenOrOdd: state => state.count % 2 === 0 ? 'even' : 'odd'
}

const modules = {
  aCount: {
    namespaced: true,
    state:{count:0},
    mutations:{
      increment(state, payload){
        state.count +=payload
      }
    },
    actions:{
      increment: ({ commit }, payload) => commit('increment', payload),
    }
  },
  bCount: {
    namespaced: true,
    state:{count:0},
    mutations:{
      increment(state, payload){
        state.count +=payload
      }
    },
    actions:{
      increment: ({ commit }, payload) => commit('increment', payload),
    }
  }
}

export default createStore({
  state,
  getters,
  actions,
  mutations,
  modules
})
