
// 1. 怎么触发子项目渲染（调用single-spa-vue里的mount函数）
export const registerApplication=({name, app, activeWhen})=>{
    app().then(item=>{
        item.mount(app)
    })
}

export const start=()=>{
    console.log('start~~~')
}

function matchSubProject(curLocation, projects){
    projects.forEach(config => {
        config._isMatch = false
    })
}