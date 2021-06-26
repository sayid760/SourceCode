export function installModule(store, rootState, path, module){
    let isRoot = !path.length
    const namespace = store._modules.getNamespace(path)

    // 如果有命名空间
    if (module.namespaced) {
        store._modulesNamespaceMap[namespace] = module
    }

    if(!isRoot){
        let parentState = path.slice(0,-1).reduce((state,key)=>state[key], rootState)
        parentState[path[path.length-1]] = module.state
    }

    const local = module.context = makeLocalContext(store, namespace, path)

    module.forEachChild((child, key) => {
        installModule(store, rootState, path.concat(key), child)
    })

    /* 把_rawModule的mutations数据copy到组件实例的_mutations上
        _mutations:{
          // aCount/increment: [fn, fn] // 源码里是数组形式处理，这里只对应一个函数
          aCount/increment: fn
        }
    */
    module.forEachMutation((mutation, key) => {
        const namespacedType = namespace + key
        store._mutations[namespacedType] = (payload)=>{ 
          mutation.call(store, local.state, payload)
        }
    })
    
    module.forEachAction((action, key) => {
        const type = action.root ? key : namespace + key
        const handler = action.handler || action
        console.log('type', type)
        console.log('handler', handler)
        store._actions[type] = (payload)=>{ 
          handler.call(store, local, payload)
        }
    })
    
    module.forEachGetter((getter, key) => {
        const namespacedType = namespace + key
        store.getters = {}
        Object.defineProperty(store.getters, namespacedType, {
          get: namespace === ''
          ? () => getter(store.state) : () => getter(local.state)
        })
    })
}

function makeLocalContext (store, namespace, path) {
    const noNamespace = namespace === ''
  
    const local = {
      dispatch: noNamespace ? store.dispatch : (_type, _payload, _options) => {
        const args = unifyObjectStyle(_type, _payload, _options)
        const { payload, options } = args
        let { type } = args
  
        if (!options || !options.root) {
          type = namespace + type
        }
  
        return store.dispatch(type, payload)
      },
  
      commit: noNamespace ? store.commit : (_type, _payload, _options) => {
        const args = unifyObjectStyle(_type, _payload, _options)
        const { payload, options } = args
        let { type } = args
  
        if (!options || !options.root) {
          type = namespace + type
        }
  
        store.commit(type, payload, options)
      }
    }

    Object.defineProperties(local, {
      getters: {
        get: noNamespace
          ? () => store.getters
          : () => makeLocalGetters(store, namespace)
      },
      state: {
        get: () => getNestedState(store.state, path)
      }
    })
  
    return local
}

function getNestedState (state, path) {
  return path.reduce((state, key) => state[key], state)
}

function unifyObjectStyle (type, payload, options) {
    if (type.type) {
      options = payload
      payload = type
      type = type.type
    }
    return { type, payload, options }
  }
  