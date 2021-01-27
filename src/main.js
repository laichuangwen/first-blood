import createApp from './library/front-create-app';
const app = createApp()
app
.task('工具方法', app => require('./library/front-util/index').default(app))
.task('状态管理', app => require('./library/front-store').default(app))
.task('重置css样式', () => require('./library/front-reset-css').default())
.task('iconfont图标', () => require('./library/front-icon').default())
.task('elementUI组件', app => require('./library/front-element-ui').default(app))
.task('路由', [], app => require('./library/front-router').default(app))
.task('初始化路由',['路由'], ({Vue}) => {
  Vue.$ctx.router.addRoutes(require('./views/router').default)
})
.task('初始化状态管理',['状态管理'],({Vue}) => {
  // 用户store
  Vue.$ctx.store.registerModule(['users'],require('./views/store').default)
  // 设置store
  Vue.$ctx.store.registerModule(['setting'],require('./views/setting/store').default)
  // git store
  Vue.$ctx.store.registerModule(['git'],require('./views/git/store').default)
  // yapi store
  Vue.$ctx.store.registerModule(['yapi'],require('./views/yapi//store').default)
})
.task('请求处理',['初始化状态管理'], app => require('./library/front-api').default(app))
.use(app.getAllTask())
.start()
window.Vue = app.Vue