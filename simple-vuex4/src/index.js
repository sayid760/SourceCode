
import { useStore } from './injectKey'
import { Store } from './store'

function createStore (options) {
    return new Store(options)
}

export {
    useStore,
    createStore
}

/**
root={
    _rawModule: rootModule,
    state: rootModule.state,
    _children:{
        aCount:{
            _rawModule: aModule,
            state: aModule.state
            _children: {}
        },
        bCount:{
            _rawModule: bModule,
            state: bModule.state
            _children: {}
        }
    }
} 
*/