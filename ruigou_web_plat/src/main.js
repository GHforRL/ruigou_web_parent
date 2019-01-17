import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
import routes from './routes'
// import Mock from './mock'
// Mock.bootstrap();
import 'font-awesome/css/font-awesome.min.css'

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

//NProgress.configure({ showSpinner: false });

//对axios进行统一配置
import axios from 'axios' //和引入vue一样
//var axios = require('axios')
// axios.defaults.baseURL = " https://www.easy-mock.com/mock/5c397bd50f501e020225d588/ruigou/services"//配置前缀 easymock
axios.defaults.baseURL = "http://127.0.0.1:9527/services"//配置前缀
// 将API方法绑定到全局  /plat/login
Vue.prototype.$http = axios //取了别名
Vue.prototype.$staticIp = "http://120.79.93.42" //给Vue这个类添加一个原型的属性,这个类的对象都能调用
Vue.config.productionTip = false
const router = new VueRouter({
  routes
})

//路由每次执行前,都会判断是否登录
router.beforeEach((to, from, next) => {
  //NProgress.start();
  if (to.path == '/login') {
    //sessionStorage 前端中session
    sessionStorage.removeItem('user');
  }
  //c从session获取用户
  let user = JSON.parse(sessionStorage.getItem('user'));

  //null表示false !null=true
  if (!user && to.path != '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
  //el: '#app',
  //template: '<App/>',
  router,
  store,
  //components: { App }
  render: h => h(App)
}).$mount('#app')

