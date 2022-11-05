import type {
  pagesJson_DTYPE,
  shallowInfo_DTYPE,
  shallow_DTYPE,
  tabList_DTYPE,
  pagesKV_DTYPE,
  newPagesJson_DTYPE
} from './types/imba-uni-routerJson'

export const useRouterJson = (pagesJson: pagesJson_DTYPE) => {
  const router: newPagesJson_DTYPE = {}
  const shallow: shallow_DTYPE = []

  const tabBarJson = pagesJson.tabBar?.list.map((tabbar) => {
    tabbar.iconPath = `${tabbar?.iconPath ? `/${tabbar?.iconPath}` : ''}`
    tabbar.pagePath = `${tabbar?.pagePath ? `/${tabbar?.pagePath}` : ''}`
    tabbar.selectedIconPath = `${tabbar.selectedIconPath ? `/${tabbar?.selectedIconPath}` : ''}`
    return tabbar
  }) as tabList_DTYPE

  // 转换为router键值格式
  const forRouter = (list: Array<shallowInfo_DTYPE>, space: string): pagesKV_DTYPE => {
    let main: pagesKV_DTYPE = {}
    list.forEach((page: shallowInfo_DTYPE) => {
      let info = page,
        path = info.path,
        spl = path.split('/')
      info.path = `/${space !== 'pages' ? `${space}/` : ''}${path}`
      const name = spl[spl.length - 1]
      main[name] = info
      info.name = name
      info.space = space
      shallow.push(info)
    })
    return main
  }

  // 主包
  router['pages'] = forRouter(pagesJson.pages, 'pages')
  // 子包
  pagesJson.subPackages?.forEach(({ root, pages }) => (router[root as keyof newPagesJson_DTYPE] = forRouter(pages, root)))
  // 广度列表
  router['shallow'] = shallow
  // tabbar
  router['tabList'] = tabBarJson
  // pageJson源数据
  router['pagesJson'] = pagesJson

  return router
}
