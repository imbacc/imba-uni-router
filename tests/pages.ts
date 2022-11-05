export const json = {
  easycom: {},
  pages: [
    {
      path: 'pages/index/index',
      style: {
        navigationBarTitleText: 'index',
        'app-plus': {
          titleNView: false
        }
      }
    },
    {
      path: 'pages/login/login',
      param: {
        test: '1111'
      },
      style: {
        'app-plus': {
          titleNView: false
        }
      }
    },
    {
      path: 'pages/index/user',
      style: {
        navigationBarTitleText: '我的',
        enablePullDownRefresh: false
      }
    }
  ],
  globalStyle: {
    navigationBarTextStyle: 'white',
    navigationBarTitleText: 'uni-app',
    navigationBarBackgroundColor: '#F8F8F8',
    backgroundColor: '#F8F8F8'
  },
  tabBar: {
    borderStyle: 'white',
    backgroundColor: 'white',
    color: '#CCCCCC',
    selectedColor: '#F5612A',
    list: [
      {
        pagePath: 'pages/index/index',
        iconPath: 'static/logo.png',
        selectedIconPath: 'static/logo.png',
        text: '首页'
      },
      {
        pagePath: 'pages/index/user',
        text: '我的'
      }
    ]
  },
  subPackages: [
    {
      root: 'pagesA',
      pages: [
        {
          diy: '蟹不肉',
          path: 'aa/aa',
          style: {
            navigationBarBackgroundColor: '#F5612A',
            navigationBarTextStyle: 'white',
            navigationBarTitleText: 'aa'
          }
        },
        {
          auth: ['user'],
          path: 'aa22/aa22',
          style: {
            navigationBarBackgroundColor: '#F5612A',
            navigationBarTextStyle: 'white',
            navigationBarTitleText: 'aa22'
          }
        }
      ]
    },
    {
      root: 'pagesB',
      pages: [
        {
          auth: ['user'],
          path: 'bb/bb',
          style: {
            navigationBarBackgroundColor: '#F5612A',
            navigationBarTextStyle: 'white',
            navigationBarTitleText: 'bb'
          }
        },
        {
          auth: ['user'],
          path: 'bb22/bb22',
          style: {
            navigationBarBackgroundColor: '#F5612A',
            navigationBarTextStyle: 'white',
            navigationBarTitleText: 'bb22'
          }
        }
      ]
    }
  ]
}
