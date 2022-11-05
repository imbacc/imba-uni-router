uni-app 框架封装的路由

## 安装

```
# pnpm
pnpm i imba-uni-router
```

## 使用

### 首先先注册路由
```
import { createSSRApp } from 'vue' import App from './App.vue'
import { createRouter } from 'imba-uni-router'
import pages from '@/pages.json'

export function createApp() { 
	const app = createSSRApp(App)
	app.use(store)
	createRouter(pages as any) 
	return { app }
}

```

### 追加useBeforeEach useAfterEach useRouterError
```
例:
import { useBeforeEach, useAfterEach, useRouterError } from 'imba-uni-router'

useRouterError((err: any) => {
	console.error('-------------------111111', err)
})

useBeforeEach((to, from, next) => {
	console.log('%c [ useBeforeEach to ]-24', 'font-size:14px; background:#41b883; color:#ffffff;', to)
	console.log('%c [ useBeforeEach from ]-24', 'font-size:14px; background:#41b883; color:#ffffff;', from)
	next()
})

useAfterEach((to, from) => {
	console.log('%c [ useAfterEach to ]-32', 'font-size:14px; background:#41b883; color:#ffffff;', to)
	console.log('%c [ useAfterEach from ]-32', 'font-size:14px; background:#41b883; color:#ffffff;', from)
})

```

### 基本使用
```
import { useRouter, useRoute } from 'imba-uni-router'

const router = useRouter()
const route = useRoute()

const sleep = () => {
	return new Promise<void>((resolve) => {
		setTimeout(() => {
			resolve()
		}, 300)
	})
}

router
	.hooks((next) => {
		console.log('sync 1--------')
		next()
		// next(false) 传入true 或 false 不传默认为true
	})
	.hooks((next) => {
		console.log('sync 2--------')
		next()
	})
	.hooks((next) => {
		console.log('sync 3--------')
		next()
	})
	.hooks((next) => {
		console.log('async 4---------')
		setTimeout(() => {
			console.log('async 5---------')
			next()
		}, 333)
	})
	.hooks((next) => {
		console.log('6---------')
		new Promise<void>((resolve) => {
			setTimeout(() => {
				console.log('7---------')
				resolve()
			}, 300)
		}).then(() => {
			next()
		})
	})
	.hooks(async (next) => {
		console.log('8---------')
		await sleep()
		console.log('9---------')
		await next()
	})
	.hooks((next) => {
		console.log('Promise then 10---------')
		sleep().then(() => {
			console.log('Promise then 11-------------')
			next()
		})
	})
	.push('/pages/index/test', { aa: 'i am params' }, { bb: 'i am query' })
	.hooks((next) => {
		console.log('hooks 12--------------')
		next()
		console.log('hooks 13----------------')
	})
	.hooks((next) => {
		console.log('last hooks 14-------------')
		next()
		console.log('last hooks 15-------------')
	})

setTimeout(() => {
	router.push('/pagesA/aa22/aa22')
	setTimeout(() => {
		router.push('/pagesB/bb/bb')
		setTimeout(() => {
			uni.navigateBack()
			console.log('%c [ router ]-94', 'font-size:14px; background:#41b883; color:#ffffff;', router)
		}, 18000)
	}, 12000)
}, 6000)
```
