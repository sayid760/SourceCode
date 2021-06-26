import { reactive } from 'vue'
import { storeKey } from './injectKey'
import { ModuleCollection } from './module'
import { installModule } from './store-utils'
import { forEachValue } from './utils'


// 拿到createStore的参数，分别挂载到当前组件的store上
export class Store{
    constructor(options){
        const store = this

        this._committing = false
        this._actions = Object.create(null)
        this._mutations = Object.create(null)
        this._modules = new ModuleCollection(options)
        this._modulesNamespaceMap = Object.create(null)
        
        // 定义状态
        const state = store._modules.root.state 
        // 给store添加状态
        installModule(store, state, [], store._modules.root)

        // 初始化数据
        // resetStoreState(this, state)
        store._state = reactive({data: state})
     
        const _getters = options.getters 
        store.getters = {}
        forEachValue(_getters, function(fn, key){
            Object.defineProperty(store.getters, key, {
                get:()=> fn(store.state) 
            })
        })

        // 挂载commit和dispatch
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

    get state () {
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
