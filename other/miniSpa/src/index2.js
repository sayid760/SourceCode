/* 2. 通过路由判断加载对应的子项目
 */
const apps = []; // 注册时存储所有的子应用
let curLocation = null; // 当前的url

const reroute = () => {
  apps.forEach((item) => {
    // 找出跟当前url对应的应用，进行挂载
    if (window.location.pathname === item.activeWhen[0]) {
      curLocation = window.location.pathname;
      item.app().then((i) => {
        i.mount(i);
      });
    }
  });
};

export const registerApplication = ({ name, app, activeWhen }) => {
  // 收集子项目属性
  apps.push({
    name,
    app,
    activeWhen,
  });
};

export const start = () => {
  console.log("start~~~");

  // 加载应用
  reroute();
};

const patchedUpdateState = (updateState, methodName) => {
  return function () {
    const preUrl = window.location.href;
    updateState.apply(this, arguments); // 调用history.pushState({},'','/')
    const curUrl = window.location.href;

    if (preUrl !== curUrl) {
      // 触发事件（类似操作浏览器前进后退）
      window.dispatchEvent(new window.PopStateEvent("popstate"));
    }
  };
};

// 重写history.pushState函数
window.history.pushState = patchedUpdateState(
  window.history.pushState,
  "pushState"
);

window.addEventListener("popstate", (event) => {
  // 现在的url跟原来的不一样
  if (window.location.pathname !== curLocation) {
    reroute();
  }
});
