export default function singleSpaVue(userOpts) {
    console.log('userOpts', userOpts)
    const opts={
       ...userOpts
    }

    let mountedInstances = {};

    return {
        bootstrap: bootstrap.bind(null, opts, mountedInstances),
        mount: mount.bind(null, opts, mountedInstances),
        unmount: unmount.bind(null, opts, mountedInstances),
        update: update.bind(null, opts, mountedInstances),
      };
}

function bootstrap(opts) {
    console.log('bootstrap', bootstrap)
    return Promise.resolve();
}
  
function mount(opts, mountedInstances, props) {
    const instance = {}
 
    return Promise.resolve().then(() => {
        let domEl
        // 判断dom上是否已经有<div id="single-spa-application:@sigrid/app1"></div>
        if (opts.appOptions.flag) {
            domEl = document.querySelector(opts.appOptions.flag);
        }else{
            domEl = document.createElement("div");
            domEl.id = `single-spa-application:${props.name}`;
            opts.appOptions.flag = `#${CSS.escape(domEl.id)}`;
            document.body.appendChild(domEl);
        }

        let singleSpaContainer = document.createElement("div");
        singleSpaContainer.className = "single-spa-container";
        domEl.appendChild(singleSpaContainer);
        
        instance.vueInstance = new opts.Vue(opts.appOptions)
        .$mount(document.querySelector('.single-spa-container'));

        instance.domEl = domEl

        mountedInstances[props.name] = instance
        
        return instance.vueInstance
    });
}
  
function update(opts, mountedInstances, props) {
    return Promise.resolve().then(() => {
        console.log('update', update)
    });
}
  
function unmount(opts, mountedInstances, props) {
    return Promise.resolve().then(() => {
        const instance = mountedInstances[props.name]

        // 删除挂载dom
        instance.vueInstance.$destroy()
        instance.vueInstance.$el.innerHTML = ""
        
        delete instance.vueInstance
      
        if (instance.domEl) {
          instance.domEl.innerHTML = ""
          delete instance.domEl
        }
    })
}
