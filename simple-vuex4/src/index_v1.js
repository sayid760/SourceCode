
import { inject, reactive } from 'vue'

/*
1. 拿到createStore的参数，分别挂载到当前组件的store上

*/
// 对象的数据拼接完再给fn函数
function forEachValue(obj, fn){
    Object.keys(obj).forEach(key=>fn(obj[key], key))
}

// forEachValue({a:1, b:2}, function(value, key){
//     console.log(value, key)
// })

const storeKey = 'store'

class Store{
    constructor(options){
        const store = this

        store._state = reactive({data: options.state})
        const _getters = options.getters 
        
        store.getters = {}

        forEachValue(_getters, function(fn, key){
            Object.defineProperty(store.getters, key, {
                get:()=> fn(store.state) 
            })
        })

        store._mutations = Object.create(null)
        store._actions = Object.create(null)
        const _mutations = options.mutations
        const _actions = options.actions
        
        // 遍历对象，把对象都挂载到store._mutations对象上
        // mutation相当于 store.commit('add', 1) commit执行mutations里的同步操作
        forEachValue(_mutations, function(mutation, key){
            store._mutations[key] = (payload)=>{ 
                mutation.call(store, store.state, payload)
            }
        })

        // action相当于 store.dispatch('asyncAdd', 1)  dispatch执行actions里的同步操作
        forEachValue(_actions, function(action, key){
            store._actions[key] = (payload)=>{ 
                action.call(store, store, payload)
            }
        })
    }
    get state(){
        return this._state.data
    }
    install (app, injectKey) {
        // 把store挂载到上下文的provide上，全局都可以访问
        app.provide(injectKey || storeKey, this)
        // 配置全局属性和方法，在页面可以直接使用$store.getters.xxx
        app.config.globalProperties.$store = this 
    }
    commit=(type, payload)=>{
        this._mutations[type](payload)
    }
    dispatch=(type, payload)=>{
        this._actions[type](payload)
    }
}

function createStore (options) {
    console.log(options)
    return new Store(options)
}

function useStore (key = null) {
    return inject(key !== null ? key : storeKey)
}

export {
    useStore,
    createStore
}