import { forEachValue } from './utils'

class Module{
    constructor(rawModule){
        this._rawModule = rawModule,
        this.state = rawModule.state,
        this._children = {}
    }
    
    get namespaced () {
        return !!this._rawModule.namespaced
    }

    addChild(key, module){
        this._children[key] = module 
    }

    getChild(key){
        return this._children[key]
    }
  
    forEachChild (fn) {
        forEachValue(this._children, fn)
    }

    forEachGetter (fn) {
        if (this._rawModule.getters) {
            forEachValue(this._rawModule.getters, fn)
        }
    }

    forEachAction (fn) {
        if (this._rawModule.actions) {
            forEachValue(this._rawModule.actions, fn)
        }
    }

    forEachMutation (fn) { 
        console.log('_rawModule',this._rawModule )
        if (this._rawModule.mutations) {
            forEachValue(this._rawModule.mutations, fn)
        }
    }

}

export class ModuleCollection{
    constructor(rootModule){
        this.root = null
        // 把属性挂载到组件上
        this.register(rootModule, [])
    }
    register(rawModule, path){
        const newModule = new Module(rawModule)
        // 根模块
        if(path.length===0){
            this.root = newModule
        }else{ // [a] [b] [a,c] this.root._children.a._children.c
            const parent = path.slice(0,-1).reduce((module, current)=>{
                return module.getChild(current)
            }, this.root)
            parent.addChild(path[path.length-1], newModule)
        }

        if(rawModule.modules){
            forEachValue(rawModule.modules, (rawChildModule, key) =>{
                this.register(rawChildModule, path.concat(key))
            })
        }
    }
    getNamespace (path) {
        let module = this.root
        console.log('path', path)
        return path.reduce((namespace, key) => {
          module = module.getChild(key)
          console.log('module',  module)
          return namespace + (module.namespaced ? key + '/' : '')
        }, '')
    }
}