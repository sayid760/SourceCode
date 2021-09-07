
export const registerApplication=({name, app, activeWhen})=>{
    console.log(app)
    // console.log('start~~~')
    app().then(item=>{
        console.log(item)
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