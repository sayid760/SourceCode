
import Vue from "vue";
import miniSpaVue from "../../../src/mini-spa-vue";
// import singleSpaVue from "../../../single-spa-vue/dist/esm/single-spa-vue";
import VueRouter from 'vue-router';
import App from "./App.vue";

Vue.config.productionTip = false

const router = new VueRouter({
  base:  '/',
  mode: 'history',
  routes: [],
});


const vueLifecycles = miniSpaVue({
  Vue,
  appOptions: {
    router,
    render: (h) => h(App),
  }
});

export const bootstrap = vueLifecycles.bootstrap
export const mount = vueLifecycles.mount
export const unmount = vueLifecycles.unmount

// console.log(miniSpaVue)
