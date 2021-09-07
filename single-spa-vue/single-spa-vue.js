/**
const vueLifecycles = singleSpaVue({
  Vue,
  appOptions: {
    render(h) {
      return h(App, {
        props: {
          name: this.name,
          mountParcel: this.mountParcel,
          singleSpa: this.singleSpa,
        },
      });
    },
  },
});

export const bootstrap = vueLifecycles.bootstrap;
export const mount = vueLifecycles.mount;
export const unmount = vueLifecycles.unmount;

 */



import "css.escape";

const defaultOpts = {
  // required opts
  appOptions: null,
  template: null,

  // sometimes require opts
  Vue: null,
  createApp: null,
  handleInstance: null,
};

export default function singleSpaVue(userOpts) {
  if (typeof userOpts !== "object") {
    throw new Error(`single-spa-vue requires a configuration object`);
  }

  // 合并参数
  const opts = { 
    ...defaultOpts,
    ...userOpts,
  };

  if (!opts.Vue && !opts.createApp) {
    throw Error("single-spa-vue must be passed opts.Vue or opts.createApp");
  }

  if (!opts.appOptions) {
    throw Error("single-spa-vue must be passed opts.appOptions");
  }

  if (
    opts.appOptions.el &&
    typeof opts.appOptions.el !== "string" &&
    !(opts.appOptions.el instanceof HTMLElement)
  ) {
    throw Error(
      `single-spa-vue: appOptions.el must be a string CSS selector, an HTMLElement, or not provided at all. Was given ${typeof opts
        .appOptions.el}`
    );
  }

  opts.createApp = opts.createApp || (opts.Vue && opts.Vue.createApp);

    // 只是一个共享对象来存储挂载的对象状态
    // 关键字-单spa应用程序的名称，因为它是唯一的
  let mountedInstances = {}; 

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
    update: update.bind(null, opts, mountedInstances),
  };
}

function bootstrap(opts) {
  if (opts.loadRootComponent) {
    return opts.loadRootComponent().then((root) => (opts.rootComponent = root));
  } else {
    return Promise.resolve();
  }
}

function resolveAppOptions(opts, props) {
  if (typeof opts.appOptions === "function") {
    return opts.appOptions(props);
  }
  return Promise.resolve({ ...opts.appOptions });
}

function mount(opts, mountedInstances, props) {
  const instance = {};
  return Promise.resolve().then(() => {
    return resolveAppOptions(opts, props).then((appOptions) => { // appOptions为app的实例对象，实例上有挂载的domElement
      if (props.domElement && !appOptions.el) {
        appOptions.el = props.domElement;
      }

      let domEl;
      if (appOptions.el) { // 如果有el，给domEl设置css id
        if (typeof appOptions.el === "string") {
          domEl = document.querySelector(appOptions.el);
          if (!domEl) {
            throw Error(
              `If appOptions.el is provided to single-spa-vue, the dom element must exist in the dom. Was provided as ${appOptions.el}`
            );
          }
        } else {
          domEl = appOptions.el;
          if (!domEl.id) {
            domEl.id = `single-spa-application:${props.name}`;
          }
          appOptions.el = `#${CSS.escape(domEl.id)}`; // 给domEl设置css id
        }
      } else {
        // 如果没有，创建一个<div id="xxx"></div>载体，用于虚拟dom挂载
        const htmlId = `single-spa-application:${props.name}`;
        appOptions.el = `#${CSS.escape(htmlId)}`;
        domEl = document.getElementById(htmlId);
        if (!domEl) {
          domEl = document.createElement("div");
          domEl.id = htmlId;
          document.body.appendChild(domEl);
        }
      }

      if (!opts.replaceMode) {
        appOptions.el = appOptions.el + " .single-spa-container";
      }

      // single-spa-vue@>=2 always REPLACES the `el` instead of appending to it.
      // We want domEl to stick around and not be replaced. So we tell Vue to mount
      // into a container div inside of the main domEl
      if (!domEl.querySelector(".single-spa-container")) {
        const singleSpaContainer = document.createElement("div");
        singleSpaContainer.className = "single-spa-container";
        domEl.appendChild(singleSpaContainer);
      }

      instance.domEl = domEl;

      if (!appOptions.render && !appOptions.template && opts.rootComponent) {
        appOptions.render = (h) => h(opts.rootComponent);
      }

      if (!appOptions.data) {
        appOptions.data = {};
      }

      appOptions.data = () => ({ ...appOptions.data, ...props });

      if (opts.createApp) {
        instance.vueInstance = opts.createApp(appOptions);
        if (opts.handleInstance) {
          return Promise.resolve(
            opts.handleInstance(instance.vueInstance, props)
          ).then(function () {
            instance.root = instance.vueInstance.mount(appOptions.el);
            mountedInstances[props.name] = instance;  // 给空对象挂载instance

            return instance.vueInstance;
          });
        } else {
          instance.root = instance.vueInstance.mount(appOptions.el);
        }
      } else {
        instance.vueInstance = new opts.Vue(appOptions);
        if (instance.vueInstance.bind) {
          instance.vueInstance = instance.vueInstance.bind(
            instance.vueInstance
          );
        }
        if (opts.handleInstance) {
          return Promise.resolve(
            opts.handleInstance(instance.vueInstance, props)
          ).then(function () {
            mountedInstances[props.name] = instance; // 给空对象挂载instance
            return instance.vueInstance;
          });
        }
      }

      mountedInstances[props.name] = instance;

      return instance.vueInstance;
    });
  });
}

function update(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    const instance = mountedInstances[props.name];
    const data = {
      ...(opts.appOptions.data || {}),
      ...props,
    };
    const root = instance.root || instance.vueInstance;
    for (let prop in data) {
      root[prop] = data[prop];
    }
  });
}

function unmount(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    const instance = mountedInstances[props.name];
    if (opts.createApp) {
      instance.vueInstance.unmount(instance.domEl);
    } else {
      instance.vueInstance.$destroy();
      instance.vueInstance.$el.innerHTML = "";
    }
    delete instance.vueInstance;

    if (instance.domEl) {
      instance.domEl.innerHTML = "";
      delete instance.domEl;
    }
  });
}