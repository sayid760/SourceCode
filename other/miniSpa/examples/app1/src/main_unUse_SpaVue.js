import Vue from "vue";
import VueRouter from 'vue-router';
import App from "./App.vue";

Vue.config.productionTip = false

let router = null
let instance = {}

function render(props = {}) {
  const { container } = props;
  console.log(container)
  router = new VueRouter({
    base:  '/',
    mode: 'history',
    routes: [],
  });

  let domEl = document.createElement("div");
  let singleSpaContainer = document.createElement("div");
  singleSpaContainer.className = "single-spa-container";

  domEl.id = 'single-spa-application:@sigrid/app1';
  // const el = `#${CSS.escape(domEl.id)}`;
  domEl.appendChild(singleSpaContainer);
  document.body.appendChild(domEl);

  instance.vueInstance = new Vue({
    router,
    // store,
    render: (h) => h(App),
    // el: ".single-spa-container"
  })
  .$mount(document.querySelector(".single-spa-container"));

  instance.domEl = domEl
}

export async function bootstrap() {
  console.log('[vue] vue app bootstraped')
}

export async function mount(props={}) {
  console.log('[vue] props from main framework', props)
  render(props)
}

export async function unmount() {
  console.log('instance1111', instance)
  instance.vueInstance.$destroy()
  instance.vueInstance.$el.innerHTML = ""
  router = null
  delete instance.vueInstance
  console.log('instance2222', instance)

  if (instance.domEl) {
    instance.domEl.innerHTML = ""
    delete instance.domEl
  }
}
