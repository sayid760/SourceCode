
/* 2. 怎么控制只渲染一个子项目
 // 判断应用是否重名  /applications/apps.js
  通过路由判断
*/
const apps = [];

export const registerApplication=({name, app, activeWhen})=>{
    console.log(name)

    // 收集子项目属性
    apps.push({
        name,
        app,
        activeWhen
    })

}

export const start=()=>{
    console.log('start~~~')
    
    // 加载应用
    reroute()
    
}

function reroute(){
   

    apps.forEach(item=>{
        if(window.location.pathname === item.activeWhen[0]){
            item.app().then(i=>{
                i.mount(i)
            })
        }
    })
}

