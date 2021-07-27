import { noop } from 'lodash'
import type { ParcelConfigObject } from 'single-spa'
import { mountRootParcel, registerApplication, start as startSingleSpa } from 'single-spa'
import type { ObjectType } from './interfaces'
import type { FrameworkConfiguration, FrameworkLifeCycles, LoadableApp, MicroApp, RegistrableApp } from './interfaces'
import type { ParcelConfigObjectGetter } from './loader'
import { loadApp } from './loader'
import { doPrefetchStrategy } from './prefetch'
import { Deferred, getContainer, getXPathForElement, toArray } from './utils'

let microApps: Array<RegistrableApp<Record<string, unknown>>> = []

// eslint-disable-next-line import/no-mutable-exports
export let frameworkConfiguration: FrameworkConfiguration = {}

let started = false
const defaultUrlRerouteOnly = true

const frameworkStartedDefer = new Deferred<void>()

export function registerMicroApps<T extends ObjectType>(
  apps: Array<RegistrableApp<T>>,
  lifeCycles?: FrameworkLifeCycles<T>,
) {
  // 过滤掉已存在的，确保只注册一个
  const unregisteredApps = apps.filter((app) => !microApps.some((registeredApp) => registeredApp.name === app.name))

  microApps = [...microApps, ...unregisteredApps]

  unregisteredApps.forEach((app) => {
    const { name, activeRule, loader = noop, props, ...appConfig } = app

    registerApplication({
      name,
      app: async() => {
        // 是main应用的全局loader样式
        loader(true)
        // 这里做了flag作用，当走到start启动应用函数里的frameworkStartedDefer.resolve()才走await下面的代码，否则就一直阻塞
        await frameworkStartedDefer.promise

        const { mount, ...otherMicroAppConfigs } = (
          await loadApp({ name, props, ...appConfig }, frameworkConfiguration, lifeCycles)
        )()

        console.log('mount', mount)
        console.log('otherMicroAppConfigs', otherMicroAppConfigs)

        return {
          // 匹配对应的路由地址，获取到对应的loader，执行loading
          mount: [async() => loader(true), ...toArray(mount), async() => loader(false)],
          ...otherMicroAppConfigs
        }
      },
      activeWhen: activeRule,
      customProps: props
    })
  })
}

const appConfigPromiseGetterMap = new Map<string, Promise<ParcelConfigObjectGetter>>()

export function loadMicroApp<T extends ObjectType>(
  app: LoadableApp<T>,
  configuration?: FrameworkConfiguration,
  lifeCycles?: FrameworkLifeCycles<T>,
): MicroApp {
  const { props, name } = app

  const getContainerXpath = (container: string | HTMLElement): string | void => {
    const containerElement = getContainer(container)
    if (containerElement) {
      return getXPathForElement(containerElement, document)
    }

    return undefined
  }

  const wrapParcelConfigForRemount = (config: ParcelConfigObject): ParcelConfigObject => {
    return {
      ...config,
      // empty bootstrap hook which should not run twice while it calling from cached micro app
      bootstrap: () => Promise.resolve()
    }
  }

  /**
   * using name + container xpath as the micro app instance id,
   * it means if you rendering a micro app to a dom which have been rendered before,
   * the micro app would not load and evaluate its lifecycles again
   */
  const memorizedLoadingFn = async(): Promise<ParcelConfigObject> => {
    const userConfiguration = configuration ?? { ...frameworkConfiguration, singular: false }
    const { $$cacheLifecycleByAppName } = userConfiguration
    const container = 'container' in app ? app.container : undefined

    if (container) {
      // using appName as cache for internal experimental scenario
      if ($$cacheLifecycleByAppName) {
        const parcelConfigGetterPromise = appConfigPromiseGetterMap.get(name)
        if (parcelConfigGetterPromise) return wrapParcelConfigForRemount((await parcelConfigGetterPromise)(container))
      }

      const xpath = getContainerXpath(container)
      if (xpath) {
        const parcelConfigGetterPromise = appConfigPromiseGetterMap.get(`${name}-${xpath}`)
        if (parcelConfigGetterPromise) return wrapParcelConfigForRemount((await parcelConfigGetterPromise)(container))
      }
    }

    const parcelConfigObjectGetterPromise = loadApp(app, userConfiguration, lifeCycles)

    if (container) {
      if ($$cacheLifecycleByAppName) {
        appConfigPromiseGetterMap.set(name, parcelConfigObjectGetterPromise)
      } else {
        const xpath = getContainerXpath(container)
        if (xpath) appConfigPromiseGetterMap.set(`${name}-${xpath}`, parcelConfigObjectGetterPromise)
      }
    }

    return (await parcelConfigObjectGetterPromise)(container)
  }

  if (!started) {
    // We need to invoke start method of single-spa as the popstate event should be dispatched while the main app calling pushState/replaceState automatically,
    // but in single-spa it will check the start status before it dispatch popstate
    // see https://github.com/single-spa/single-spa/blob/f28b5963be1484583a072c8145ac0b5a28d91235/src/navigation/navigation-events.js#L101
    // ref https://github.com/umijs/qiankun/pull/1071
    startSingleSpa({ urlRerouteOnly: frameworkConfiguration.urlRerouteOnly ?? defaultUrlRerouteOnly })
  }

  return mountRootParcel(memorizedLoadingFn, { domElement: document.createElement('div'), ...props })
}

export function start(opts: FrameworkConfiguration = {}) {
  frameworkConfiguration = { prefetch: true, singular: true, sandbox: true, ...opts }
  const {
    prefetch,
    sandbox,
    singular,
    urlRerouteOnly = defaultUrlRerouteOnly,
    ...importEntryOpts
  } = frameworkConfiguration

  // 检查prefetch属性，如果需要预加载，则添加全局事件single-spa:first-mount监听，在第一个子应用挂载后预加载其他子应用资源，优化后续其他子应用的加载速度
  if (prefetch) {
    doPrefetchStrategy(microApps, prefetch, importEntryOpts)
  }

  // 参数设置是否启用沙箱运行环境，隔离
  if (sandbox) {
    if (!window.Proxy) {
      console.warn('[qiankun] Miss window.Proxy, proxySandbox will degenerate into snapshotSandbox')
      frameworkConfiguration.sandbox = typeof sandbox === 'object' ? { ...sandbox, loose: true } : { loose: true }
      // 快照沙箱不支持非singular模式
      if (!singular) {
        console.warn(
          '[qiankun] Setting singular as false may cause unexpected behavior while your browser not support window.Proxy',
        )
      }
    }
  }
  // 启动主应用 single-spa
  startSingleSpa({ urlRerouteOnly })
  started = true

  frameworkStartedDefer.resolve()
}
