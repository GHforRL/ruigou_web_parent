import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import user from './views/plat/user.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Brand from './views/commodity/Brand.vue'
import commodityType from './views/commodity/commodityType.vue'
import Commodity from "./views/commodity/Commodity.vue";

let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    {
        path: '/',
        component: Home,
        name: '首页',
        leaf: true,//只有一个节点
        iconCls: 'fa fa-home',
        redirect: { path: '/main' },
        children: [
            { path: '/main', component: echarts, name: '首页' }
        ]
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '商品模块',
        iconCls: 'fa fa-shopping-bag',//图标样式class
        children: [
            { path: '/commodityBrand', component: Brand, name: '商品品牌'},
            { path: '/commodityType', component: commodityType, name: '商品类型' },
            { path: '/commodity', component: Commodity, name: '商品管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'fa fa-th-large',
        children: [
            { path: '/user', component: user, name: '用户管理' },
        ]
    },
    {
        path: '/',
        component: Home,
        name: '营销管理',
        iconCls: 'fa fa-line-chart',
        children: [
            { path: '/page6', component: Page6, name: '营销活动管理' }
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;