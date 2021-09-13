/* 3. 怎么控制只渲染一个子项目
 */
const apps = [] // 注册时存储所有的子应用
let curLocation = null // 当前的url
let mountApps = []

const reroute = () => {
  apps.forEach((item) => {
    // 找出跟当前url对应的应用，进行挂载
    if (window.location.pathname === item.activeWhen[0]) {
      curLocation = window.location.pathname
      item.app().then((i) => {
        const a = i.mount(item)
        mountApps.push(i)
      })
    } else {
      mountApps.forEach((app, index) => {
        app.unmount(item) // 卸载应用
        mountApps.splice(index, 1) // 卸载完，清空数组
      })
    }
  })
}

export const registerApplication = ({ name, app, activeWhen, customProps }) => {
  // 收集子项目属性
  apps.push({
    name,
    app,
    activeWhen,
  })
}

export const start = () => {
  console.log("start~~~")

  // 加载应用
  reroute()
}

const patchedUpdateState = (updateState, methodName) => {
  return function () {
    const preUrl = window.location.href
    updateState.apply(this, arguments) // 调用history.pushState({},'','/')
    const curUrl = window.location.href

    if (preUrl !== curUrl) {
      // 触发事件（类似操作浏览器前进后退）
      window.dispatchEvent(new window.PopStateEvent("popstate"))
    }
  }
}

// 重写history.pushState函数
window.history.pushState = patchedUpdateState(
  window.history.pushState,
  "pushState"
)

window.addEventListener("popstate", (event) => {
  // 现在的url跟原来的不一样
  if (window.location.pathname !== curLocation) {
    reroute()
  }
})

// function getProps(appOrParcel) {
//     var name = toName(appOrParcel);
//     var customProps = typeof appOrParcel.customProps === "function" ? appOrParcel.customProps(name, window.location) : appOrParcel.customProps;

//     if (_typeof(customProps) !== "object" || customProps === null || Array.isArray(customProps)) {
//       customProps = {};
//       console.warn(formatErrorMessage(40, "single-spa: ".concat(name, "'s customProps function must return an object. Received ").concat(customProps)), name, customProps);
//     }

//     var result = assign({}, customProps, {
//       name: name,
//       mountParcel: mountParcel.bind(appOrParcel),
//       singleSpa: singleSpa
//     });

//     if (isParcel(appOrParcel)) {
//       result.unmountSelf = appOrParcel.unmountThisParcel;
//     }

//     return result;
//   }
