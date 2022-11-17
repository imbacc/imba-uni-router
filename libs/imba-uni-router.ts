import type { pagesJson_DTYPE, shallowInfo_DTYPE, newPagesJson_DTYPE } from './types/imba-uni-routerJson'
import type { kv_DTYPE, pushParams_DTYPE, before_DTYPE, after_DTYPE } from './types/imba-uni-router'

import { useRouterJson } from './imba-uni-routerJson'
import stringify from 'qs-stringify'

const shallowCacheSymbol = Symbol('shallowCache')
const routerChunksSymbol = Symbol('routerChunks')
const beforeEachSymbol = Symbol('beforeEach')
const afterEachSymbol = Symbol('afterEach')
const useErrorSymbol = Symbol('useError')
const getRouteSymbol = Symbol('getRoute')
const getRouterChunksSymbol = Symbol('getRouterChunks')
const routerHooksListSymbol = Symbol('routerHooksList')
const nextLockSymbol = Symbol('nextLock')
const nextTimeSymbol = Symbol('nextTime')
const routerBeforeSymbol = Symbol('routerBefore')
const routerAfterSymbol = Symbol('routerAfter')
const errorCallbackSymbol = Symbol('errorCallback')

type Partial_shallowInfo_DTYPE = Partial<shallowInfo_DTYPE>
class Router {
  private [shallowCacheSymbol]: { [key: string]: shallowInfo_DTYPE } = {}
  private [routerChunksSymbol]: newPagesJson_DTYPE = {}

  public routerHistoryList: Array<Partial_shallowInfo_DTYPE> = []
  public curRouter: Partial_shallowInfo_DTYPE = {}
  public routerQuery: kv_DTYPE = {}
  public routeParams: kv_DTYPE = {}
  public to: Object = {}
  public from: Object = {}

  private [routerBeforeSymbol]: before_DTYPE = (to: {}, from: {}, next) => next()
  private [routerAfterSymbol]: after_DTYPE = () => {}
  private [errorCallbackSymbol]: Function = () => {}

  private [routerHooksListSymbol]: Array<Function> = []
  private [nextLockSymbol]: boolean = false
  private [nextTimeSymbol]: any = null

  constructor(pagesJson: pagesJson_DTYPE) {
    this[routerChunksSymbol] = Object.freeze(useRouterJson(pagesJson))
    this.init()
  }

  /**
   * 定位初始to from
   */
  private initToFrom() {
    const cur = getCurrentPages()
    const bool = cur.length === 0
    const url = bool ? '/' : (cur[0] as any)?.$page.path
    if (bool || url === '/') {
      if ((this[routerChunksSymbol].tabList?.length as number) > 0) {
        const firstPath = this[routerChunksSymbol].tabList?.[0]?.pagePath
        const find = this.shallowFind(firstPath as string)
        if (find) this.curRouter = find
      } else {
        this.curRouter = Object.assign({}, this[routerChunksSymbol].pagesJson?.pages[0])
      }
    } else {
      this.curRouter = this.shallowFind(url)
    }

    const to = Object.assign({}, this.curRouter)
    this.to = to
    this.routerHistoryList.push(to)
  }

  /**
   * 初始化路由信息
   */
  private init() {
    this.initToFrom()

    uni.addInterceptor('navigateBack', {
      invoke: () => {
        const from = Object.assign({}, this.curRouter)
        this.routerHistoryList.pop()
        const len = this.routerHistoryList.length
        if (len > 0) {
          const to = this.routerHistoryList[len - 1]
          this.to = to as shallowInfo_DTYPE
          this.curRouter = to as shallowInfo_DTYPE
        } else {
          this.initToFrom()
        }
        this.from = from
      }
    })
  }

  /**
   * 基于重写设定赋值
   */
  private overrideParams(path: string | kv_DTYPE, params?: kv_DTYPE, query?: kv_DTYPE) {
    let _path = '',
      _params: kv_DTYPE = {},
      _query: kv_DTYPE = {},
      newPath

    if (typeof path === 'string') {
      if (path !== '') _path = path
      if (params) _params = (params || {}) as Object
      if (query) _query = (query || {}) as Object
    } else {
      const argParams = path as pushParams_DTYPE
      const keys = Object.keys(argParams)
      const kvInkey = {
        path: (val: any) => {
          if (val) _path = val
        },
        params: (val: any) => {
          if (val) _params = val
        },
        query: (val: any) => {
          if (val) _query = val
        }
      }
      keys.forEach((key) => {
        kvInkey[key as keyof pushParams_DTYPE](argParams[key as keyof pushParams_DTYPE])
      })
    }

    if (Object.keys(_params).length > 0) {
      const newQuery: kv_DTYPE = {}
      Object.keys(_query).map((key) => {
        newQuery[key] = encodeURIComponent(_query[key])
      })
      newPath = `${path}?${stringify(newQuery)}`
    }

    return { _path, _params, _query, newPath, delta: 0 }
  }

  /**
   * 设置to from 并找到源
   * @param path
   * @param newPath
   * @returns
   */
  private toFromFind(path: string, newPath: string) {
    const find = this.shallowFind(path)
    const to = Object.assign({}, find)
    const from = Object.assign({}, this.curRouter)

    this.to = to
    this.from = from

    if (!find) {
      console.error(`无效的跳转${newPath}`)
      return null
    }

    return { to, from, find }
  }

  /**
   * 封装跳转载体
   * @param navigateApi 对应uni api
   * @param args 基础参数 { path, params, query }
   * @returns Promise<void>
   */
  private navigatePage(
    navigateApi: (options: UniNamespace.NavigateToOptions & UniNamespace.NavigateBackOptions) => void,
    args: kv_DTYPE<any>
  ) {
    const { _path, _params, _query, newPath } = args
    const options: UniNamespace.NavigateToOptions & UniNamespace.NavigateBackOptions = { url: newPath || _path }

    const reverse = this.toFromFind(_path, newPath)
    if (!reverse) return Promise.resolve()

    // 如果是tabbar类型跳转不对 矫正跳转类型 switchTab
    const isSwicthTab = this[routerChunksSymbol]?.tabList?.some((s) => s.pagePath === _path)
    if (isSwicthTab) {
      navigateApi = uni.switchTab
    }

    return new Promise<void>((resolve) => {
      options.success = () => {
        if (_params) this.routeParams = _params
        if (_query) this.routerQuery = _query
        this.curRouter = reverse.to
        this.routerHistoryList.push(reverse.to)
      }

      options.fail = (err) => {
        this[errorCallbackSymbol]?.(err)
      }

      options.complete = () => {
        resolve()
      }

      navigateApi?.(options)
    })
  }

  /**
   * apiTo API
   * @param path
   * @param params
   * @param query
   * @param api
   * @returns
   */
  private apiTo(path: string | pushParams_DTYPE, params?: kv_DTYPE, query?: kv_DTYPE, api?: any) {
    const overrideResult = this.overrideParams(path, params, query)
    const reverse = this.toFromFind(overrideResult._path, overrideResult.newPath || '')
    if (!reverse) {
      this.clearHooks()
      return this
    }
    this.hooks((next) => {
      this.navigatePage.call(this, api, overrideResult).then(() => next())
    })
  }

  /**
   * 返回到N级页面
   * @param n
   */
  go(delta: number = 1) {
    this.hooks((next) => {
      uni.navigateBack({
        delta,
        fail: (err) => this[errorCallbackSymbol]?.(err),
        complete: () => next()
      })
    })
    return this
  }

  /**
   * 返回上一页
   */
  back() {
    this.go(1)
    return this
  }

  /**
   * 保留当前页面 对应 uni.navigateTo
   */
  push(path: string | pushParams_DTYPE, params?: kv_DTYPE, query?: kv_DTYPE): Router {
    this.apiTo(path, params, query, uni.navigateTo)
    return this
  }

  /**
   * 关闭当前页 对应 uni.redirectTo
   */
  replace(path: string | pushParams_DTYPE, params?: kv_DTYPE, query?: kv_DTYPE): Router {
    this.apiTo(path, params, query, uni.redirectTo)
    return this
  }

  /**
   * 关闭所有页面 对应 uni.reLaunch
   */
  replaceAll(path: string | pushParams_DTYPE, params?: kv_DTYPE, query?: kv_DTYPE): Router {
    this.apiTo(path, params, query, uni.reLaunch)
    return this
  }

  /**
   * 跳转到tabbar栏页面 对应 uni.switchTab
   */
  swicthTab(path: string | pushParams_DTYPE, params?: kv_DTYPE, query?: kv_DTYPE): Router {
    this.apiTo(path, params, query, uni.switchTab)
    return this
  }

  /**
   * 注入钩子
   * @param fun
   * @returns
   */
  hooks(fun: (next: (result?: boolean) => void) => void) {
    const resolve = (res?: boolean) => {
      if (res !== false) {
        this[nextLockSymbol] = false
        this.nextHook()
      } else {
        this.clearHooks()
        this[routerAfterSymbol].call(this, this.to, this.from)
      }
    }

    clearTimeout(this[nextTimeSymbol])
    this.useHooks(fun.bind(this, resolve))
    /**
     * 链式都是同步的
     * setTimeout 让最后一个执行函数执行nextHook
     */
    this[nextTimeSymbol] = setTimeout(() => {
      this[routerBeforeSymbol].call(this, this.to, this.from, () => this.nextHook())
      clearTimeout(this[nextTimeSymbol])
    })
    return this
  }

  /**
   * 迭代到下一个狗子
   */
  private nextHook() {
    if (this[nextLockSymbol]) return this
    if (this[routerHooksListSymbol].length <= 0) {
      this[routerAfterSymbol].call(this, this.to, this.from)
      return this
    }

    this[nextLockSymbol] = true
    let t = setTimeout(() => {
      clearTimeout(t)
      const hooks = this[routerHooksListSymbol].shift()
      hooks?.call(this)
    })
    return this
  }

  /**
   * 注入狗子
   * @param fun
   */
  private useHooks(fun: Function) {
    this[routerHooksListSymbol].push(fun)
  }

  /**
   * 清除钩子
   */
  private clearHooks() {
    clearTimeout(this[nextTimeSymbol])
    let t = setTimeout(() => {
      clearTimeout(t)
      clearTimeout(this[nextTimeSymbol])
      this[nextLockSymbol] = false
      this[routerHooksListSymbol] = []
    })
  }

  /**
   * 查找地址定位配置信息
   * @param url
   * @returns
   */
  private shallowFind(url: string) {
    const idx = url.indexOf('/')
    if (idx !== 0) url = `/${url}`
    const cache = this[shallowCacheSymbol][url]
    if (cache) return cache
    const find = this[routerChunksSymbol].shallow?.find((f) => f.path === url)
    if (find) this[shallowCacheSymbol][url] = find
    return find as shallowInfo_DTYPE
  }

  /**
   * 前狗子
   * @param fun
   * @returns
   */
  [beforeEachSymbol](fun: before_DTYPE) {
    // to, from, next
    if (fun && typeof fun === 'function') {
      this[routerBeforeSymbol] = fun
    } else {
      throw new Error('beforeEach function error!')
    }
    return this
  }

  /**
   * 后狗子
   * @param fun
   * @returns
   */
  [afterEachSymbol](fun: after_DTYPE) {
    // to, from
    if (fun && typeof fun === 'function') {
      this[routerAfterSymbol] = fun
    } else {
      throw new Error('afterEach function error!')
    }
    return this
  }

  /**
   * 获取路由列表数据
   * @returns
   */
  [getRouterChunksSymbol]() {
    return this[routerChunksSymbol]
  }

  /**
   * 获取路由信息
   * @returns
   */
  [getRouteSymbol]() {
    const { to, from, routeParams, routerQuery, curRouter, routerHistoryList } = this
    return {
      to,
      from,
      params: routeParams,
      query: routerQuery,
      curRouter,
      routerHistoryList
    }
  }

  /**
   * 错误抛出
   * @param callback
   */
  [useErrorSymbol](callback: Function): void {
    if (callback) this[errorCallbackSymbol] = callback
  }
}

let r: Router
export const createRouter = (pagesJson: pagesJson_DTYPE) => {
  if (!r) r = new Router(pagesJson)
  return r
}

export const useRouter = () => {
  if (!r) {
    throw new Error('没有实例化路由,请执行createRouter!')
  }
  return r
}

export const useRouterError = (callback: Function) => {
  return r[useErrorSymbol](callback)
}

export const useRoute = () => {
  // return r[getRouteSymbol]()
  return r
}

export const useBeforeEach = (fun: before_DTYPE) => {
  return r[beforeEachSymbol](fun)
}

export const useAfterEach = (fun: after_DTYPE) => {
  return r[afterEachSymbol](fun)
}

export const useRouterChunks = () => {
  return r[getRouterChunksSymbol]()
}
